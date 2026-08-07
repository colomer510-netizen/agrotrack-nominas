using AgroTrack.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace AgroTrack.Infrastructure.Data
{
    public class AgroTrackDbContext : DbContext
    {
        public DbSet<Operario> Operarios { get; set; }
        public DbSet<TransaccionPesaje> TransaccionesPesaje { get; set; }
        public DbSet<ContenedorExportacion> Contenedores { get; set; }

        public AgroTrackDbContext(DbContextOptions<AgroTrackDbContext> options) : base(options)
        {
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Operario>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Codigo).IsRequired().HasMaxLength(20);
                entity.Property(e => e.Nombre).IsRequired().HasMaxLength(100);
            });

            modelBuilder.Entity<TransaccionPesaje>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.PesoBruto).HasColumnType("decimal(18,2)");
                entity.Property(e => e.BolsasBase).HasColumnType("decimal(18,2)");
                entity.Property(e => e.KilosExcedentes).HasColumnType("decimal(18,2)");
                entity.Property(e => e.BolsasExtra).HasColumnType("decimal(18,2)");
                entity.Property(e => e.TarifaAplicada).HasColumnType("decimal(18,2)");
                entity.Property(e => e.TotalGanado).HasColumnType("decimal(18,2)");

                entity.HasOne(d => d.Operario)
                      .WithMany(p => p.Transacciones)
                      .HasForeignKey(d => d.OperarioId)
                      .OnDelete(DeleteBehavior.Restrict);
            });
        }
    }
}
