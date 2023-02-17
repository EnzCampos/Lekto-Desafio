using MongoDB.Bson;
using MongoDB.Bson.Serialization;
using SharpCompress.Archives.Zip;
using System.ComponentModel.DataAnnotations;

namespace Lekto_Desafio.Models
{
    public class User
    {
        public ObjectId Id { get; set; }

        public string Cpf { get; set; } = "";

        public string Name { get; set; } = "";

        public string Email { get; set; } = "";

        public string PhoneNumber { get; set; } = "";

        public Address[] Adresses { get; set; }

        public byte[] PasswordHash { get; set; } = new byte[0];

        public byte[] PasswordSalt { get; set; } = new byte[0];

    }

    public class PasswordHash
    {
        public byte[]? Hash { get; set; }

        public byte[]? HashSalt { get; set;}
    }

    public class Address
    {
        public string? Cep { get; set; }
        public string? Cidade { get; set; }
        public string? Endereco { get; set; }

        public string? Estado { get; set; }
    }
}
