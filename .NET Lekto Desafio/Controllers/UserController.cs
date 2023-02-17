using Lekto_Desafio.Dtos;
using Lekto_Desafio.Interfaces;
using Lekto_Desafio.Models;
using Lekto_Desafio.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Cryptography;
using System.Text;

namespace Lekto_Desafio.Controllers
{
    [ApiController]
    [Authorize]
    [Route("users")]
    public class UserController : Controller
    {

        private readonly IUserRepository _userRepository;
        private readonly ITokenService _tokenService;

        public UserController(IUserRepository userRepository, ITokenService tokenService)
        {
            _userRepository = userRepository;
            _tokenService = tokenService;
        }

        [HttpGet]
        public async Task<IEnumerable<UserDto>> GetUsersAsync()
        {
            var users = (await _userRepository.GetUsersAsync()).Select(user => user.AsDto());

            return users;
        }

        [HttpGet("{Cpf}")]
        public async Task<ActionResult<UserDto>> GetUserAsync(string Cpf)
        {
            var filteredUser = await _userRepository.GetUserByCpfAsync(Cpf);

            if (filteredUser == null)
            {
                return NotFound();
            }

            return filteredUser.AsDto();
        }

        [HttpPost]
        public async Task<ActionResult<UserDto>> CreateUserAsync(CreateUserDto createUser)
        {

            if (await _userRepository.GetUserByCpfAsync(createUser.Cpf) != null)
            {
                return BadRequest("Usuário com este CPF, já existe.");
            }

            if (await _userRepository.GetUserByEmailAsync(createUser.Email) != null)
            {
                return BadRequest("Usuário com este Email, já existe.");
            }

            PasswordHash hashedPassword = HashPassword(createUser.Password);

            var user = new User
            {
                Cpf = createUser.Cpf,
                Name = createUser.Name,
                Email = createUser.Email,
                PhoneNumber = createUser.PhoneNumber,
                Adresses = createUser.Addresses,
                PasswordHash = hashedPassword.Hash,
                PasswordSalt = hashedPassword.HashSalt
            };

            await _userRepository.CreateAsync(user);

            return CreatedAtAction(nameof(GetUserAsync), new { user.Cpf}, user);
        }

        [HttpPut("{Cpf}")]
        public async Task<IActionResult> UpdateUser(string Cpf, UpdateUserDto userPayload)
        {
            var existingUser = await _userRepository.GetUserByCpfAsync(Cpf);

            if (existingUser == null)
            {
                return NotFound();
            }

            var existingUserByCpf = await _userRepository.GetUserByCpfAsync(userPayload.Cpf);
          
            if (existingUserByCpf != null && existingUserByCpf.Cpf != Cpf)
            {
                return BadRequest("Usuário com este CPF, já existe.");
            }

            var existingUserByEmail = await _userRepository.GetUserByEmailAsync(userPayload.Email);

            if (existingUserByEmail != null && existingUserByEmail.Cpf != Cpf)
            {
                return BadRequest("Usuário com este Email, já existe.");
            }

            existingUser.Cpf = userPayload.Cpf;
            existingUser.Name = userPayload.Name;
            existingUser.Email = userPayload.Email;
            existingUser.PhoneNumber = userPayload.PhoneNumber;
            existingUser.Adresses = userPayload.Addresses;

            if (userPayload.Password != null && userPayload.Password.Length > 4) {

                PasswordHash hashedPassword = HashPassword(userPayload.Password);

                existingUser.PasswordHash = hashedPassword.Hash;
                existingUser.PasswordSalt = hashedPassword.HashSalt;

            }

            await _userRepository.UpdateAsync(existingUser);

            return NoContent();
        }

        [HttpDelete("{Cpf}")]
        public async Task<IActionResult> DeleteUser(string Cpf)
        {
            var user = await _userRepository.GetUserByCpfAsync(Cpf);

            if (user == null)
            {
                return NotFound();
            }

            await _userRepository.RemoveAsync(Cpf);

            return NoContent();
        }

        [AllowAnonymous]
        [HttpPost("login")]
        public async Task<ActionResult<UserLoginDto>> Login(LoginDto loginDto)
        {
            if (loginDto.Cpf == null && loginDto.Email == null)
            {
                throw new BadHttpRequestException("Usuário deve fornecer Email ou CPF.");
            }

            User? checkUser = null;

            if (loginDto.Cpf != null)
            {
                checkUser = await _userRepository.GetUserByCpfAsync(loginDto.Cpf);
            }

            else if (loginDto.Email != null) { 
                checkUser = await _userRepository.GetUserByEmailAsync(loginDto.Email); 
            }

            if (checkUser == null)
            {
                return Unauthorized("Usuário inválido.");
            }

            using var hmac = new HMACSHA512(checkUser.PasswordSalt);

            var computedHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(loginDto.Password));

            for (int i = 0; i < computedHash.Length; i++)
            {
                if (computedHash[i] != checkUser.PasswordHash[i])
                {
                    return Unauthorized("Senha inválida.");
                }
            }

            return new UserLoginDto(checkUser.Name, _tokenService.CreateToken(checkUser));
        }

        private static PasswordHash HashPassword(string password)
        {
            using var hmac = new HMACSHA512();

            PasswordHash hashedPassword = new()
            {
                Hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(password)),
                HashSalt = hmac.Key
            };

            return hashedPassword;
        }
    }
}
