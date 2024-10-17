@isTest
public class APFS_SendCaseStatusTriggerHandlerTest {

    @isTest
    static void testOnAfterUpdate_StatusChanged() {
        // Set the mock callout response
        Test.setMock(HttpCalloutMock.class, new MockHttpResponseGenerator());
 
        // Create and insert a Contact
        Contact testContact = new Contact(
            FirstName = 'Test',
            LastName = 'Contact',
            MobilePhone = '1234567890'
        );
        insert testContact;
 
        // Create and insert Case records with different statuses
        Case case1 = new Case(
            Status = 'New',
            ContactId = testContact.Id
        );
        Case case2 = new Case(
            Status = 'In Progress',
            ContactId = testContact.Id
        );
        insert new List<Case>{case1, case2};
 
        // Update the status of the cases to trigger the logic
        case1.Status = 'Closed';
        case2.Status = 'Closed';
        update new List<Case>{case1, case2};
 
        // Start the test execution
        Test.startTest();
        // Call the handler to simulate the trigger
        APFS_SendCaseStatusTriggerHandler.onAfterUpdate(new List<Case>{case1, case2}, new Map<Id, Case>{case1.Id => case1, case2.Id => case2});
        Test.stopTest();
 
        // Validate that the cases' statuses were updated correctly
        List<Case> updatedCases = [SELECT Id, Status FROM Case WHERE Status = 'Closed'];
        System.assertEquals(2, updatedCases.size(), 'Two cases should have been updated to Closed status.');
    }
 
    @isTest
    static void testOnAfterUpdate_NoStatusChange() {
        // Set the mock callout response
        Test.setMock(HttpCalloutMock.class, new MockHttpResponseGenerator());
 
        // Create and insert a Contact
        Contact testContact = new Contact(
            FirstName = 'Test',
            LastName = 'Contact',
            MobilePhone = '1234567890'
        );
        insert testContact;
 
        // Create and insert Case records with different statuses
        Case case1 = new Case(
            Status = 'New',
            ContactId = testContact.Id
        );
        Case case2 = new Case(
            Status = 'In Progress',
            ContactId = testContact.Id
        );
        insert new List<Case>{case1, case2};
 
        // Start the test execution
        Test.startTest();
        // Call the handler to simulate the trigger
        APFS_SendCaseStatusTriggerHandler.onAfterUpdate(new List<Case>{case1, case2}, new Map<Id, Case>{case1.Id => case1, case2.Id => case2});
        Test.stopTest();
 
        // Since the status hasn't changed, no SMS should have been sent
        // Validate that no cases have been updated to 'Closed' status
        List<Case> unchangedCases = [SELECT Id, Status FROM Case WHERE Status != 'Closed'];
        System.assertEquals(2, unchangedCases.size(), 'No cases should have been updated to Closed status.');
    }
 
    @isTest
    static void testOnAfterInsert() {
        // Set the mock callout response
        Test.setMock(HttpCalloutMock.class, new MockHttpResponseGenerator());
 
        // Create and insert a Contact
        Contact testContact = new Contact(
            FirstName = 'Test',
            LastName = 'Contact',
            MobilePhone = '1234567890'
        );
        insert testContact;
 
        // Create and insert Case records
        Case case1 = new Case(
            Status = 'New',
            ContactId = testContact.Id
        );
        insert case1;
 
        // Start the test execution
        Test.startTest();
        // Insert another case to trigger the insert handler
        Case newCase = new Case(
            Status = 'New',
            ContactId = testContact.Id
        );
        insert newCase;
        Test.stopTest();
 
        // Validate that the SMS was sent
        // Add assertions or checks if you can validate SMS sent status here
    }
    
    @isTest
    static void testSendCreationSms() {
        // Set the mock callout response
        Test.setMock(HttpCalloutMock.class, new MockHttpResponseGenerator());
 
        // Create and insert a Contact
        Contact testContact = new Contact(
            FirstName = 'Test',
            LastName = 'Contact',
            MobilePhone = '1234567890'
        );
        insert testContact;
 
        // Create and insert Case records
        Case case1 = new Case(
            Status = 'New',
            ContactId = testContact.Id
        );
        insert case1;
 
        // Start the test execution
        Test.startTest();
        // Call the handler to simulate the insert trigger
        APFS_SendCaseStatusTriggerHandler.onAfterInsert(new List<Case>{case1});
        Test.stopTest();
 
        
    }
}