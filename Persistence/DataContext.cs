using Domain;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Persistence
{
    public class DataContext : IdentityDbContext<AppUser>
    {
        public DataContext(DbContextOptions options) : base(options)
        {
        }

        public DbSet<Activity> Activities { get; set; }
        public DbSet<ActivityAttendee> ActivityAttendees { get; set; }
        public DbSet<Photo> Photos { get; set; }
        public DbSet<Comment> Comments { get; set; }
        public DbSet<UserFollowing> UserFollowings { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            builder.Entity<ActivityAttendee>(x => x.HasKey(a => new { a.AppUserId, a.ActivityId }));

            builder.Entity<ActivityAttendee>()
                .HasOne(u => u.AppUser)
                .WithMany(o => o.Activities)
                .HasForeignKey(a => a.AppUserId);

            builder.Entity<ActivityAttendee>()
                .HasOne(u => u.Activity)
                .WithMany(o => o.Attendees)
                .HasForeignKey(a => a.ActivityId);

            builder.Entity<Comment>()
                .HasOne(a => a.Activity)
                .WithMany(b => b.Comments)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<UserFollowing>(a =>
            {
                a.HasKey(b => new { b.ObserverId, b.TargetId });

                a.HasOne(o => o.Observer)
                    .WithMany(f => f.Followings)
                    .HasForeignKey(p => p.ObserverId)
                    .OnDelete(DeleteBehavior.Cascade);

                a.HasOne(o => o.Target)
                    .WithMany(f => f.Followers)
                    .HasForeignKey(p => p.TargetId)
                    .OnDelete(DeleteBehavior.Cascade);
            });


        }
    }
}