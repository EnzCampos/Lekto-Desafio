using Lekto_Desafio.Models;
using MongoDB.Driver;

namespace Lekto_Desafio.Repositories
{
    public class UserRepository : IUserRepository
    {
        private const string collectionName = "users";

        private readonly IMongoCollection<User> mongoCollection;

        private readonly FilterDefinitionBuilder<User> filterBuilder = Builders<User>.Filter;

        public UserRepository(IMongoDatabase database)
        {
            mongoCollection = database.GetCollection<User>(collectionName);
        }

        public async Task<IReadOnlyCollection<User>> GetUsersAsync()
        {
            return await mongoCollection.Find(filterBuilder.Empty).ToListAsync();
        }

        public async Task<User> GetUserByCpfAsync(string Cpf)
        {
            FilterDefinition<User> filter = filterBuilder.Eq(user => user.Cpf, Cpf);

            return await mongoCollection.Find(filter).FirstOrDefaultAsync();
        }

        public async Task<User> GetUserByEmailAsync(string Email)
        {
            FilterDefinition<User> filter = filterBuilder.Eq(user => user.Email, Email);

            return await mongoCollection.Find(filter).FirstOrDefaultAsync();
        }

        public async Task CreateAsync(User user)
        {
            if (user == null)
            {
                throw new ArgumentNullException(nameof(user));
            }

            await mongoCollection.InsertOneAsync(user);
        }

        public async Task UpdateAsync(User user)
        {
            if (user == null)
            {
                throw new ArgumentNullException(nameof(user));
            }

            FilterDefinition<User> filter = filterBuilder.Eq(existingUser => existingUser.Cpf, user.Cpf);

            await mongoCollection.ReplaceOneAsync(filter, user);
        }

        public async Task RemoveAsync(string Cpf)
        {
            FilterDefinition<User> filter = filterBuilder.Eq(user => user.Cpf, Cpf);

            await mongoCollection.DeleteOneAsync(filter);
        }

    }
}
