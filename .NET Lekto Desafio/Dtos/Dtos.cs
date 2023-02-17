using Lekto_Desafio.Models;
using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;
using System.Text.RegularExpressions;

namespace Lekto_Desafio.Dtos
{

    public record UserDto(
        string Cpf, 

        string Name, 

        string Email, 

        string PhoneNumber,

        Address[] Addresses,

        byte[] PasswordHash,

        byte[] PasswordSalt
        );

    public record CreateUserDto(
        [Required]
  
        [IsValidCPF]
        string Cpf,

        [Required]
        [MinLength(4)]
        [RegularExpression(@"^(?i)[a-záàâãéèêíïóôõöúçñ ]+$", ErrorMessage = "Nome deve conter apenas letras e espaços.")] 
        string Name,

        [Required]
        [EmailAddress(ErrorMessage = "Email inválido.")] 
        string Email,

        [Required]
        [MinLength(1)]
        Address[] Addresses,

        [Required]
        //[RegularExpression("", ErrorMessage = "Telefone inválido.")]
        string PhoneNumber,

        [Required]
        [RegularExpression(@"(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[#$@!%&*?]).{4,}", ErrorMessage = "Senha deve conter letras maiúsculas, minúsculas e caracteres especiais.")] 
        string Password);

    public record UpdateUserDto(
        [Required]
        [IsValidCPF]
        string Cpf,

        [MinLength(4)]
        [RegularExpression(@"^(?i)[a-záàâãéèêíïóôõöúçñ ]+$", ErrorMessage = "Nome deve conter apenas letras e espaços.")] 
        string Name, 

        [EmailAddress] 
        string Email, 

        //[RegularExpression("", ErrorMessage = "Telefone inválido.")] 
        string PhoneNumber,

        [Required]
        [MinLength(1)]
        Address[] Addresses,

        [RegularExpression(@"(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[#$@!%&*?]).{4,}", ErrorMessage = "Senha deve conter letras maiúsculas, minúsculas e caracteres especiais.")] 
        string? Password
    );

    public record LoginDto(
        string? Cpf,
        string? Email,

        [Required]
        string Password
    );

    public record UserLoginDto(
        string Name,
        string Token
    );
}

public class IsValidCPF : ValidationAttribute 
{
    protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
    {
        if (value == null) return new ValidationResult("CPF inválido, valor não pode ser nulo.");

        string regex = @"^[0-9]{3}[\.]{1}[0-9]{3}[\.]{1}[0-9]{3}[-]{1}[0-9]{2}$";

        if (!Regex.IsMatch((string)value, regex))
        {
            return new ValidationResult("CPF inválido, confira o formato.");
        }

        string[] cpf = value.ToString().Replace(".", "").Split("-");

        string digits = cpf[0];
        string validationNumbers = cpf[1];


        int firstDigitValidationSum = 0;
        int secondDigitValidationSum = 0;

        for (int i = 0; i < 9; i++)
        {
            firstDigitValidationSum += int.Parse(digits[i].ToString()) * (10 - i);
        }

        for (int i = 0; i < 10; i++)
        {
            if (i == 9)
            {
                secondDigitValidationSum += int.Parse(validationNumbers[0].ToString()) * 2;
            }

            else secondDigitValidationSum += int.Parse(digits[i].ToString()) * (11 - i);
        }

        int firstDigitValidation = firstDigitValidationSum % 11;
        int secondDigitValidation = secondDigitValidationSum % 11;

        bool firstValidation = (firstDigitValidation > 2 ? 11 - firstDigitValidation : 0) == int.Parse(validationNumbers[0].ToString());

        bool secondValidation = (secondDigitValidation > 2 ? 11 - secondDigitValidation : 0) == int.Parse(validationNumbers[1].ToString());

        return firstValidation && secondValidation ? ValidationResult.Success : new ValidationResult("CPF inválido");
    }
}
