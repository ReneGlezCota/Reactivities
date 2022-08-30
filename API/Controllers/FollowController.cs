using Application.Followers;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    public class FollowController : BaseApiController
    {
        [HttpPost("{username}")]
        public async Task<IActionResult> Follow(string username)
        {
            var result = await Mediator.Send(new FollowToggle.Command { TargetUsername = username });

            return HandleResult(result);
        }

        [HttpGet("{username}")]
        public async Task<IActionResult> GetFollowings(string username, string predicate)
        {
            var result = await Mediator.Send(new List.Query { Username = username, Predicate = predicate });

            return HandleResult(result);
        }
    }
}