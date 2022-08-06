.print ""
.print "Dropping all existing tables and data..."
.print ""

DROP TABLE IF EXISTS Users;
DROP TABLE IF EXISTS Salespeople;
DROP TABLE IF EXISTS Appointments;
DROP TABLE IF EXISTS LoginTokens;

.print "Finished dropping all tables and data..."
.print ""

.print "-----"
.print "Moving to table creation functions..."
.print "-----"
.print ""

.print "Creating 'Users' table..."
.print "-----"
.print ""

CREATE TABLE Users(
	userID INTEGER PRIMARY KEY AUTOINCREMENT,
	name TEXT,
	email TEXT,
	password TEXT,
	accountLevel INTEGER,
	companyName TEXT,
	companyCategory TEXT
);

.print "Creating 'Salespeople' table..."
.print "-----"
.print ""

CREATE TABLE Salespeople(
	salespersonID INTEGER PRIMARY KEY,
	specialtyCompanyCategory TEXT,
	FOREIGN KEY (salespersonID) REFERENCES Users(userID)
);

.print "Creating 'Appointments' table..."
.print "-----"
.print ""

CREATE TABLE Appointments(
	appointmentID INTEGER PRIMARY KEY AUTOINCREMENT,
	salespersonID INTEGER,
	userID INTEGER,
	appointmentDateTime TEXT,
	FOREIGN KEY(salespersonID) REFERENCES Salespeople(salespersonID),
	FOREIGN KEY(userID) REFERENCES Users(userID)
);

.print "Creating 'LoginTokens' table..."
.print "-----"
.print ""

CREATE TABLE LoginTokens(
	tokenID INTEGER PRIMARY KEY AUTOINCREMENT,
	userID INTEGER UNIQUE,
	token TEXT,
	tokenExpiryDateTime TEXT,
	FOREIGN KEY (userID) REFERENCES Users(userID)
);

.print "Finished creating new tables with blank data..."
