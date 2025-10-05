# Database Setup for MicroPinouts

This document explains how to set up the MySQL database for the MicroPinouts application.

## Prerequisites

- MySQL server (5.7 or higher)
- PHP with PDO MySQL extension
- Web server (Apache/Nginx)

## Quick Setup

1. **Start MySQL server** and ensure it's running
2. **Run the setup script**:
   ```bash
   php setup-database.php
   ```

## Manual Setup

If you prefer to set up the database manually:

1. **Create the database**:
   ```sql
   CREATE DATABASE micropinouts;
   USE micropinouts;
   ```

2. **Run the schema file**:
   ```bash
   mysql -u root -p micropinouts < database/schema.sql
   ```

## Configuration

Update the database configuration in `api/config.php`:

```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'micropinouts');
define('DB_USER', 'root');
define('DB_PASS', 'your_password');
```

## Database Structure

### Tables Created

1. **categories** - Pinout categories (microcontrollers, development boards, etc.)
2. **published_pinouts** - Main pinout data
3. **pinout_pins** - Individual pin information
4. **user_sessions** - User session management (for future use)
5. **pinout_analytics** - Usage analytics and tracking

### Key Features

- **Full CRUD operations** for pinouts
- **Category management** with icons and colors
- **Pin data normalization** for better querying
- **Analytics tracking** for views and interactions
- **Search and filtering** capabilities
- **Pagination support** for large datasets

## API Endpoints

### Pinouts
- `GET api/pinouts.php` - List all pinouts (with pagination/filtering)
- `GET api/pinouts.php/{id}` - Get specific pinout
- `POST api/pinouts.php` - Create new pinout
- `PUT api/pinouts.php/{id}` - Update existing pinout
- `DELETE api/pinouts.php/{id}` - Delete pinout

### Categories
- `GET api/pinouts.php/categories` - Get all categories

## Testing the Setup

1. **Check database connection**:
   ```bash
   curl http://localhost/api/pinouts.php/categories
   ```

2. **Test pinout creation**:
   - Open the pinout creator
   - Create a test pinout
   - Click "Publish Pinout"
   - Check the manage pinouts page

3. **Test CRUD operations**:
   - Create, edit, and delete pinouts
   - Verify data persistence
   - Check search and filtering

## Troubleshooting

### Common Issues

1. **Database connection failed**:
   - Check MySQL is running
   - Verify credentials in `api/config.php`
   - Ensure PDO MySQL extension is installed

2. **Permission denied**:
   - Grant proper MySQL privileges to the user
   - Check file permissions on the API directory

3. **CORS errors**:
   - Ensure the API is served from the same domain
   - Check CORS settings in `api/config.php`

### Logs

Check PHP error logs for detailed error messages:
- Linux: `/var/log/apache2/error.log` or `/var/log/nginx/error.log`
- Windows: Check your web server's error log location

## Security Notes

- Change default database credentials
- Use environment variables for sensitive data
- Implement proper authentication for production use
- Validate and sanitize all input data
- Use HTTPS in production

## Backup

Regular database backups are recommended:

```bash
mysqldump -u root -p micropinouts > backup.sql
```

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Verify all prerequisites are met
3. Check PHP and MySQL error logs
4. Ensure proper file permissions