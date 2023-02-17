using Lekto_Desafio.Models;

namespace Lekto_Desafio.Repositories
{
    public interface IUserRepository
    {
        Task CreateAsync(User user);
        Task<User> GetUserByCpfAsync(string Cpf);
        Task<IReadOnlyCollection<User>> GetUsersAsync();
        Task RemoveAsync(string Cpf);
        Task UpdateAsync(User user);

        Task<User> GetUserByEmailAsync(string Email);
    }
}