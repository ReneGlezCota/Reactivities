using Application.Core;
using Application.Interfaces;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Profiles
{
    public class ListActivities
    {
        public class Query : IRequest<Result<List<UserActivityDto>>>
        {
            public string Predicate { get; set; }
            public string Username { get; set; }
        }

        public class Handler : IRequestHandler<Query, Result<List<UserActivityDto>>>
        {
            private readonly IMapper _mapper;
            private readonly DataContext _context;
            public Handler(DataContext context, IMapper mapper)
            {
                _context = context;
                _mapper = mapper;
            }

            public async Task<Result<List<UserActivityDto>>> Handle(Query request, CancellationToken cancellationToken)
            {
                var query = _context.ActivityAttendees
                    .Where(a => a.AppUser.UserName == request.Username)
                    .OrderBy(b => b.Activity.Date)
                    .ProjectTo<UserActivityDto>(_mapper.ConfigurationProvider)
                    .AsQueryable();

                switch (request.Predicate)
                {
                    case "past":
                        query = query.Where(a => a.Date <= DateTime.Now);
                        break;
                    case "hosting":
                        query = query.Where(a => a.HostUsername == request.Username);
                        break;
                    default:
                        query = query.Where(a => a.Date >= DateTime.Now);
                        break;
                }

                var result = await query.ToListAsync();

                return Result<List<UserActivityDto>>.Success(result);
            }
        }

    }
}