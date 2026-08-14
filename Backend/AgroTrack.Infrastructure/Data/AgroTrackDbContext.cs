// Copyright (C) 2026 colomer510-netizen
// This file is part of AgroTrack Nóminas.
// Licensed under the GNU Affero General Public License v3.0. See LICENSE in project root.

using AgroTrack.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace AgroTrack.Infrastructure.Data
{
    public class AgroTrackDbContext : DbContext
    {
        public DbSet<Operario> Operarios { get; set; }
        public DbSet<Productor> Productores { get; set; }
        public DbSet<TransaccionPesaje> TransaccionesPesaje { get; set; }
        public DbSet<ContenedorExportacion> Contenedores { get; set; }
        public DbSet<ConfiguracionGlobal> ConfiguracionGlobal { get; set; }
        public DbSet<LedgerTrazabilidad> LedgerTrazabilidad { get; set; }

        public AgroTrackDbContext(DbContextOptions<AgroTrackDbContext> options) : base(options)
        {
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // ── Operario ──
            modelBuilder.Entity<Operario>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.CodigoInterno).IsRequired().HasMaxLength(20);
                entity.Property(e => e.Nombre).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Procedencia).HasMaxLength(100);
            });

            // ── Productor ──
            modelBuilder.Entity<Productor>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Codigo).IsRequired().HasMaxLength(20);
                entity.Property(e => e.Nombre).IsRequired().HasMaxLength(150);
                entity.HasIndex(e => e.Codigo).IsUnique();
            });

            // ── ConfiguracionGlobal ──
            modelBuilder.Entity<ConfiguracionGlobal>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Clave).IsRequired().HasMaxLength(50);
                entity.Property(e => e.Valor).IsRequired().HasMaxLength(200);
                entity.HasIndex(e => e.Clave).IsUnique();
            });

            // ── TransaccionPesaje ──
            modelBuilder.Entity<TransaccionPesaje>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.PesoBruto).HasColumnType("decimal(18,2)");
                entity.Property(e => e.BolsasBase).HasColumnType("decimal(18,2)");
                entity.Property(e => e.KilosExcedentes).HasColumnType("decimal(18,2)");
                entity.Property(e => e.BolsasExtra).HasColumnType("decimal(18,2)");
                entity.Property(e => e.TarifaAplicada).HasColumnType("decimal(18,2)");
                entity.Property(e => e.TotalGanado).HasColumnType("decimal(18,2)");
                entity.Property(e => e.Estado).HasMaxLength(10).HasDefaultValue("Activo");
                entity.Property(e => e.Synced).HasDefaultValue(0);

                entity.HasOne(d => d.Operario)
                      .WithMany(p => p.Transacciones)
                      .HasForeignKey(d => d.OperarioId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(d => d.Productor)
                      .WithMany(p => p.Transacciones)
                      .HasForeignKey(d => d.ProductorId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasIndex(e => new { e.ProductorId, e.Fecha });
                entity.HasIndex(e => e.Synced);
            });

            // ── LedgerTrazabilidad (Append-Only) ──
            modelBuilder.Entity<LedgerTrazabilidad>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.TLC).IsRequired().HasMaxLength(100);
