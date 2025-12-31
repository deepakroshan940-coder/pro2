# Expense Tracker Web App

A personal finance dashboard web application to track, categorize, and visualize monthly expenses.

## Features

- 🔐 **User Authentication**: Register and login system with localStorage
- 💰 **Expense Management**: Add, view, and delete expenses with categories
- 📊 **Data Visualization**: 
  - Monthly expense trend chart (line chart)
  - Expense by category chart (doughnut chart)
- 📅 **Month-wise Reports**: Filter expenses by specific months
- 📈 **Dashboard Summary**: 
  - Total expenses
  - Current month expenses
  - Average daily expenses
  - Total transaction count

## Technologies Used

- HTML5
- CSS3 (with CSS Variables for theming)
- Vanilla JavaScript
- Chart.js (for data visualization)
- localStorage (for data persistence)

## Getting Started

1. **Open the Application**
   - Simply open `index.html` in a modern web browser
   - No server or build process required

2. **Register a New Account**
   - Click on the "Register" tab
   - Enter your name, email, and password
   - Click "Register"

3. **Login**
   - Use your registered email and password to login
   - You'll be redirected to the dashboard

4. **Add Expenses**
   - Fill in the expense form:
     - Amount (in ₹)
     - Category (Food, Transport, Shopping, Bills, etc.)
     - Date
     - Description (optional)
   - Click "Add Expense"

5. **View Reports**
   - Use the month filter to view expenses for a specific month
   - Click "View All" to see all expenses
   - Charts automatically update based on the selected filter

## Expense Categories

- Food
- Transport
- Shopping
- Bills
- Entertainment
- Healthcare
- Education
- Other

## Data Storage

All data is stored in the browser's localStorage:
- User accounts: `users`
- Current user session: `currentUser`
- User expenses: `expenses_{userId}`

**Note**: Data is stored locally in your browser. Clearing browser data will remove all stored information.

## Browser Compatibility

Works best on modern browsers:
- Chrome (recommended)
- Firefox
- Edge
- Safari

## Features in Detail

### Dashboard Summary Cards
- **Total Expenses**: Sum of all expenses (filtered by month if selected)
- **This Month**: Total expenses for the current month
- **Average Daily**: Average daily expense for the current month
- **Total Transactions**: Count of expense entries

### Charts
- **Monthly Expense Trend**: Line chart showing expenses for the last 6 months
- **Expense by Category**: Doughnut chart showing distribution of expenses across categories

### Month-wise Filtering
- Select any month using the month picker
- View expenses and category breakdown for that specific month
- Charts update automatically to reflect filtered data

## Future Enhancements

Potential features for future versions:
- Export data to CSV/Excel
- Budget setting and tracking
- Recurring expenses
- Multiple currency support
- Data backup/restore
- Password hashing for security
- Expense editing functionality

## License

This is a learning/assignment project. Feel free to use and modify as needed.

