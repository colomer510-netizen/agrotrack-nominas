using AgroTrack.Application.Services;
using AgroTrack.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // Manejar referencias circulares en las navegaciones de EF
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "AgroTrack Nóminas API",
        Version = "v1",
        Description = "API para el sistema de gestión de pesaje, nóminas y trazabilidad de planta procesadora."
    });
});

// CORS: Permitir al Frontend (Vite) comunicarse con la API
builder.Services.AddCors(options =>
{
    options.AddPolicy("AgroTrackPolicy", policy =>
    {
        policy.WithOrigins(
                "http://localhost:5173",   // Vite dev server
                "http://localhost:4173",   // Vite preview
                "http://localhost:3000"    // Fallback
            )
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

// Inyección de DbContext (SQLite para el entorno local/offline)
builder.Services.AddDbContext<AgroTrackDbContext>(options =>
    options.UseSqlite(
        builder.Configuration.GetConnectionString("DefaultConnection") 
        ?? "Data Source=agrotrack.db"
    ));

// Inyección de la capa de Servicios / Casos de Uso
builder.Services.AddScoped<CalculoNominaService>();

var app = builder.Build();

// Aplicar migraciones automáticamente al iniciar (desarrollo)
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<AgroTrackDbContext>();
    dbContext.Database.EnsureCreated();
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "AgroTrack API v1");
        options.RoutePrefix = "swagger";
    });
}

app.UseCors("AgroTrackPolicy");
app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();
