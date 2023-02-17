
using Lekto_Desafio.Interfaces;
using Lekto_Desafio.Repositories;
using Lekto_Desafio.Services;
using Lekto_Desafio.Settings;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using MongoDB.Driver;
using System.Text;

internal class Program
{

    public ServiceSettings serviceSettings = null!;

    private static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);

        var serviceSettings = builder.Configuration.GetSection(nameof(ServiceSettings)).Get<ServiceSettings>();

        builder.Services.AddSingleton(serviceProvider =>
        {
            MongoDbSettings mongoDbSettings = builder.Configuration.GetSection(nameof(MongoDbSettings)).Get<MongoDbSettings>();

            var mongoClient = new MongoClient(mongoDbSettings.ConnectionString);

            return mongoClient.GetDatabase(serviceSettings.ServiceName);
        });

        builder.Services.AddCors();

        builder.Services.AddSingleton<IUserRepository, UserRepository>();

        builder.Services.AddControllers(options =>
        {
            options.SuppressAsyncSuffixInActionNames = false;
        });

        builder.Services.AddScoped<ITokenService, TokenService>();

        builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["TokenKey"])),
                    ValidateIssuer = false,
                    ValidateAudience = false,
                };
            });

        // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle

        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddSwaggerGen();


        var app = builder.Build();

        // Configure the HTTP request pipeline.
        if (app.Environment.IsDevelopment())
        {
            app.UseSwagger();
            app.UseSwaggerUI();
        }

        app.UseHttpsRedirection();

        app.UseAuthentication();
        app.UseAuthorization();

        app.UseCors(builder => builder.WithOrigins("https://localhost:4200").AllowAnyMethod().AllowAnyHeader());

        app.MapControllers();

        app.Run();
    }
}

// Add services to the container.
