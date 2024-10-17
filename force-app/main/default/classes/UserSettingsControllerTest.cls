@isTest
public class UserSettingsControllerTest {

    @isTest
    static void testGetUserLanguage() {
        // Create a Contact record
        Contact testContact = new Contact(
            FirstName = 'Test',
            LastName = 'Contact',
            Email = 'testcontact@example.com',
            MobilePhone = '1234567890'
        );
        insert testContact;
           
         // Query a valid User Role for Community users
        UserRole testUserRole1 = [SELECT Id FROM UserRole WHERE Name = 'Azim Premji Foundation Scholarship Portal Site Partner User' LIMIT 1];
        // Create a portal User record with Contact association
        User testUser = new User(
            Username = 'testuser709@example.com',
            Alias = 'tuser7',
            Email = 'testuser709@example.com',
            LastName = 'User',
            EmailEncodingKey = 'ISO-8859-1',
            ProfileId = [SELECT Id FROM Profile WHERE Name = 'Scholarship Portal Applicant' LIMIT 1].Id,
            LanguageLocaleKey = 'en_US',
            UserRoleId = testUserRole1.Id,
            TimeZoneSidKey = 'America/Los_Angeles',
            LocaleSidKey = 'en_US',
            ContactId = testContact.Id  // Associate the Contact
           // UserType = 'Partner' // Set user type to Partner
        );
        insert testUser;
        
        Test.startTest();
        // Set the context user as the test user
        System.runAs(testUser) {
            // Call the method to test
            String language = UserSettingsController.getUserLanguage();
            
            // Verify the results
            System.assertEquals('en_US', language, 'The user language should be en_US');
        }
        Test.stopTest();
    }

    @isTest
    static void testUpdateUserLanguage() {
        // Create a Contact record
        Contact testContact = new Contact(
            FirstName = 'Test',
            LastName = 'Contact',
            Email = 'testcontact@example.com',
            MobilePhone = '1234567890'
        );
        insert testContact;
     // Query a valid User Role for Community users
        UserRole testUserRole2 = [SELECT Id FROM UserRole WHERE Name = 'Azim Premji Foundation Scholarship Portal Site Partner User' LIMIT 1];
        // Create a portal User record with Contact association
        User testUser = new User(
            Username = 'testuser710@example.com',
            Alias = 'tuser8',
            Email = 'testuser710@example.com',
            LastName = 'User',
            EmailEncodingKey = 'ISO-8859-1',
            ProfileId = [SELECT Id FROM Profile WHERE Name = 'Scholarship Portal Applicant' LIMIT 1].Id,
            LanguageLocaleKey = 'en_US',
            UserRoleId = testUserRole2.Id,  // Ensure the User has a Role
            TimeZoneSidKey = 'America/Los_Angeles',
            LocaleSidKey = 'en_US',
            ContactId = testContact.Id  // Associate the Contact
            //UserType = 'Partner' // Set user type to Partner
        );
        insert testUser;

        Test.startTest();
        // Set the context user as the test user
        System.runAs(testUser) {
            // Call the method to update the user's language
            UserSettingsController.updateUserLanguage('hi');
            
            // Query the updated user record
            User updatedUser = [SELECT LanguageLocaleKey FROM User WHERE Id = :UserInfo.getUserId() LIMIT 1];
            
            // Verify the results
            System.assertEquals('hi', updatedUser.LanguageLocaleKey, 'The user language should be updated to hi');
        }
        Test.stopTest();
    }
}