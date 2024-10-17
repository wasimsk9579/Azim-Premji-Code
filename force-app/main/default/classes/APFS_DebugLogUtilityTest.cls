@isTest
public class APFS_DebugLogUtilityTest {

    @isTest
    static void testLogError() {
        // Create a test user
        Contact testContact = new Contact(
            FirstName = 'John',
            LastName = 'Doe',
            Email = 'johndoe@example.com',
            MobilePhone = '9053456784'
        );
        insert testContact;
        User testUser = new User(
             FirstName = 'Jane',
            LastName = 'Smith',
            Email = 'janesmith@example.com',
            Username = 'janesmith123@example.com',
            Alias = 'jsmith',
            ProfileId = [SELECT Id FROM Profile WHERE Name = 'Standard User' LIMIT 1].Id,
            MobilePhone = '7975946497',
            CommunityNickname = 'janesmith',
            EmailEncodingKey = 'UTF-8',
            LanguageLocaleKey = 'en_US',
            LocaleSidKey = 'en_US',
            TimeZoneSidKey = 'America/New_York'           
        );
        insert testUser;

        // Prepare parameters for the logError method
        String apexType = 'Class';
        String apexName = 'APFS_DebugLogUtility';
        String methodName = 'testLogError';
        String errorMessage = 'Test error message';
        Id userId = testUser.Id;

        // Call the method
        Test.startTest();
        APFS_DebugLogUtility.logError(apexType, apexName, methodName, errorMessage, userId);
        Test.stopTest();

        // Verify that a Debug Log entry was created
        List<Debug_Log__c> logs = [SELECT Id, Apex_Type__c, Apex_Type_Name__c, Apex_Type_Method_Name__c, Error_Message__c, OwnerId 
                                    FROM Debug_Log__c 
                                    WHERE OwnerId = :userId];
        
        // Assert that the log entry was created
        System.assertEquals(1, logs.size(), 'A log entry should have been created.');
        System.assertEquals(apexType, logs[0].Apex_Type__c, 'The Apex type should match.');
        System.assertEquals(apexName, logs[0].Apex_Type_Name__c, 'The Apex name should match.');
        System.assertEquals(methodName, logs[0].Apex_Type_Method_Name__c, 'The method name should match.');
        System.assertEquals(errorMessage, logs[0].Error_Message__c, 'The error message should match.');
        System.assertEquals(userId, logs[0].OwnerId, 'The OwnerId should match the test user.');
    }
}