.print ""
.print "Starting preset account generation script..."

INSERT INTO Users(name, email, password, accountLevel, companyName, companyCategory, loginAttempts, accountLocked)
VALUES("Joe Bloggs", "joebloggs@loytechlabs.com", "$2b$10$YLBCahks2VWOjgzZRQ0iwei5/GUiNMogjMVPupcgx5FsJtsg2XWJi", 2, "Loytech Labs", "Food and Drink", 0, "false");

INSERT INTO Salespeople(salespersonID, specialtyCompanyCategory)
VALUES(1, "Food and Drink");

INSERT INTO Users(name, email, password, accountLevel, companyName, companyCategory, loginAttempts, accountLocked)
VALUES("Jane Doe", "janedoe@loytechlabs.com", "$2b$10$YLBCahks2VWOjgzZRQ0iwei5/GUiNMogjMVPupcgx5FsJtsg2XWJi", 2, "Loytech Labs", "Fashion and Accessories", 0, "false");

INSERT INTO Salespeople(salespersonID, specialtyCompanyCategory)
VALUES(2, "Fashion and Accessories");

INSERT INTO Users(name, email, password, accountLevel, companyName, companyCategory, loginAttempts, accountLocked)
VALUES("John Smith", "johnsmith@loytechlabs.com", "$2b$10$YLBCahks2VWOjgzZRQ0iwei5/GUiNMogjMVPupcgx5FsJtsg2XWJi", 2, "Loytech Labs", "Beauty and Grooming", 0, "false");

INSERT INTO Salespeople(salespersonID, specialtyCompanyCategory)
VALUES(3, "Beauty and Grooming");

INSERT INTO Users(name, email, password, accountLevel, companyName, companyCategory, loginAttempts, accountLocked)
VALUES("Joe Schmoe", "joeschmoe@loytechlabs.com", "$2b$10$YLBCahks2VWOjgzZRQ0iwei5/GUiNMogjMVPupcgx5FsJtsg2XWJi", 2, "Loytech Labs", "Culture and Learning", 0, "false");

INSERT INTO Salespeople(salespersonID, specialtyCompanyCategory)
VALUES(4, "Culture and Learning");

INSERT INTO Users(name, email, password, accountLevel, companyName, companyCategory, loginAttempts, accountLocked)
VALUES("Jane Smith", "janesmith@loytechlabs.com", "$2b$10$YLBCahks2VWOjgzZRQ0iwei5/GUiNMogjMVPupcgx5FsJtsg2XWJi", 2, "Loytech Labs", "Food and Drink", 0, "false");

INSERT INTO Salespeople(salespersonID, specialtyCompanyCategory)
VALUES(5, "Food and Drink");

.print "Finished inserting preset salespeople!"
.print ""
.print "Accounts have been generated for:"
.print "-----"
.print "joebloggs@loytechlabs.com"
.print "janedoe@loytechlabs.com"
.print "johnsmith@loytechlabs.com"
.print "joeschmoe@loytechlabs.com"
.print "janesmith@loytechlabs.com"
.print "-----"
.print ""