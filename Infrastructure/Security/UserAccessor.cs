using System.Security.Claims;
using Application.Interfaces;
using Microsoft.AspNetCore.Http;

namespace Infrastructure.Security
{
    public class UserAccessor : IUserAccessor
    {
        private readonly IHttpContextAccessor _httpContextAccesor;
        public UserAccessor(IHttpContextAccessor httpContextAccesor)
        {
            _httpContextAccesor = httpContextAccesor;
        }

        public string GetUserName()
        {
            return _httpContextAccesor.HttpContext.User.FindFirstValue(ClaimTypes.Name);
        }
    }
}