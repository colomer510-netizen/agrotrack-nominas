# Etapa de construcción (Build)
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copiar el archivo de solución y los proyectos para restaurar dependencias
COPY ["AgroTrack.sln", "./"]
COPY ["Backend/AgroTrack.Domain/AgroTrack.Domain.csproj", "Backend/AgroTrack.Domain/"]
COPY ["Backend/AgroTrack.Application/AgroTrack.Application.csproj", "Backend/AgroTrack.Application/"]
COPY ["Backend/AgroTrack.Infrastructure/AgroTrack.Infrastructure.csproj", "Backend/AgroTrack.Infrastructure/"]
COPY ["Backend/AgroTrack.Presentation/AgroTrack.Presentation.csproj", "Backend/AgroTrack.Presentation/"]

# Restaurar paquetes de NuGet
RUN dotnet restore "AgroTrack.sln"

# Copiar el resto del código
COPY . .

# Construir y publicar la aplicación
WORKDIR "/src/Backend/AgroTrack.Presentation"
RUN dotnet publish "AgroTrack.Presentation.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Etapa final (Run)
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

# Exponer el puerto que usará Render (por defecto usa el puerto definido en la variable de entorno PORT, ASP.NET Core 8 usa 8080)
ENV ASPNETCORE_HTTP_PORTS=8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "AgroTrack.Presentation.dll"]
