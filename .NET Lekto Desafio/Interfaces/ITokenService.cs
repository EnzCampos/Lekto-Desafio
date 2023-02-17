using Lekto_Desafio.Models;

namespace Lekto_Desafio.Interfaces
{
    public interface ITokenService
    {
        string CreateToken(User user);
    }
}
