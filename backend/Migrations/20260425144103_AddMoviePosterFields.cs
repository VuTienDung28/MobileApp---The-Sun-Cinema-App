using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddMoviePosterFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "PosterUrl",
                table: "Movies",
                newName: "ThumbnailPosterUrl");

            migrationBuilder.AddColumn<string>(
                name: "BackdropPosterUrl",
                table: "Movies",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BackdropPosterUrl",
                table: "Movies");

            migrationBuilder.RenameColumn(
                name: "ThumbnailPosterUrl",
                table: "Movies",
                newName: "PosterUrl");
        }
    }
}
