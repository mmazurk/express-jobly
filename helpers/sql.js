const { BadRequestError } = require("../expressError");

// Part 1

// The sqlForPartialUpdate function is passed two objects; the first object contains key-value pairs that represent data wse want to update about a user, and the second contains an object with key-value pairs that are javascript names for user fields (keys) and database names for the user fields (values). Note that the User class in user.js is just a collection of methods and doesn't have a constructor. 

// If the dataToUpdate object that is passed into the function has no keys (e.g., there are no fields to be updated and const key is an empty array), then the function throws a BadRequestError which is defined in ExpressEror.js and imported on line 1).

// If const key is NOT an empty array, then we use the .map() function and javascript template literals to create an array of statements that we can insert into the static method User.udpate(). This helper function will return an object with two key-value pairs: setCols, which contains an array of joined SQL statements we can use in a db.query(), and values, which consists of the new values that we will pass to User.update() and insert into brackets after the db.query() that we make. Since we don't know how many values there will be in User.update(), we spread the values, as shown in this line: 'const result = await db.query(querySql, [...values, username]);'. Note that querySql is created in User.update() by using setCols.

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
