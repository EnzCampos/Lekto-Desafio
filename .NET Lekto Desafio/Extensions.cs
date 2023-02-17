using Lekto_Desafio.Dtos;
using Lekto_Desafio.Models;

namespace Lekto_Desafio
{
    public static class Extensions
    {
        public static UserDto AsDto(this User user)
        {
            return new UserDto(user.Cpf, user.Name, user.Email, user.PhoneNumber, user.Adresses, user.PasswordHash, user.PasswordSalt);
        }
    }
}
