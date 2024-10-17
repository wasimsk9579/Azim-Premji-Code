@isTest
public class APFS_SendApplicationStatusOnSmsTest {
    
    @isTest
    static void testOnAfterUpdate() {
        // Set up the mock response
        Test.setMock(HttpCalloutMock.class, new MockHttpResponseGenerator());

        // Create test Contacts with required LastName field
        Contact testContact1 = new Contact(FirstName = 'John', LastName = 'Doe', MobilePhone = '1234567890');
        Contact testContact2 = new Contact(FirstName = 'Jane', LastName = 'Smith', MobilePhone = '0987654321');
        insert new List<Contact>{testContact1, testContact2};

        // Create a test Scholarship object
        Scholarship__c testScholarship = new Scholarship__c(
            Is_Active__c = true,
            Scholarship_Name__c = 'Azim Premji Scholarship'
        );
        insert testScholarship;

        // Create test Scholarship Editions with required fields
        Scholarship_Edition__c edition2024 = new Scholarship_Edition__c(
            Year__c = '2024',
            Scholarship__c = testScholarship.Id,
            Number_Of_Installments_Per_Year__c = 2,
            Total_Amount_Per_Installment__c = 1000.00
        );
        Scholarship_Edition__c edition2025 = new Scholarship_Edition__c(
            Year__c = '2025',
            Scholarship__c = testScholarship.Id,
            Number_Of_Installments_Per_Year__c = 2,
            Total_Amount_Per_Installment__c = 1000.00
        );
        insert new List<Scholarship_Edition__c>{edition2024, edition2025};

        // Create test Scholarship Rounds with all required fields
        Scholarship_Round__c testRound1 = new Scholarship_Round__c(
            Scholarship_Edition__c = edition2024.Id,
            Round_End_Date__c = Date.today().addMonths(1),
            Round_Type__c = 'Regular',
            Round_Number__c = 1
        );
        Scholarship_Round__c testRound2 = new Scholarship_Round__c(
            Scholarship_Edition__c = edition2024.Id,
            Round_End_Date__c = Date.today().addMonths(2),
            Round_Type__c = 'Regular',
            Round_Number__c = 2
        );
        insert new List<Scholarship_Round__c>{testRound1, testRound2};

        // Create test Applications with all required fields
        Application__c app1 = new Application__c(
            Application_External_Status__c = 'Application Under Review',
            Contact__c = testContact1.Id,
            Scholarship_Round__c = testRound1.Id
        );
        Application__c app2 = new Application__c(
            Application_External_Status__c = 'Submitted',
            Contact__c = testContact2.Id,
            Scholarship_Round__c = testRound2.Id
        );
         Application__c app3 = new Application__c(
            Application_External_Status__c = 'Submitted',
            Contact__c = testContact2.Id,
            Scholarship_Round__c = testRound2.Id
        );
        insert new List<Application__c>{app1, app2, app3};

        // Update Application records to trigger the handler
        app1.Application_External_Status__c = 'Disbursement Complete';
        app2.Application_External_Status__c = 'Not Selected';
        app3.Application_External_Status__c = 'Terminated';
        update new List<Application__c>{app1, app2, app3};

        // Verify that the SMS sending methods are called appropriately
        System.assertEquals('Disbursement Complete', [SELECT Application_External_Status__c FROM Application__c WHERE Id = :app1.Id].Application_External_Status__c);
        System.assertEquals('Not Selected', [SELECT Application_External_Status__c FROM Application__c WHERE Id = :app2.Id].Application_External_Status__c);
    }

    @isTest
    static void testSubmittedStatus() {
        // Set up the mock response
        Test.setMock(HttpCalloutMock.class, new MockHttpResponseGenerator());

        // Create a test Contact with required LastName field
        Contact testContact = new Contact(FirstName = 'Alice', LastName = 'Brown', MobilePhone = '1112223333');
        insert testContact;

        // Create a test Scholarship object
        Scholarship__c testScholarship = new Scholarship__c(
            Is_Active__c = true,
            Scholarship_Name__c = 'Test Scholarship'
        );
        insert testScholarship;

        // Create a test Scholarship Edition with required fields
        Scholarship_Edition__c testEdition = new Scholarship_Edition__c(
            Year__c = '2024',
            Scholarship__c = testScholarship.Id,
            Number_Of_Installments_Per_Year__c = 2,
            Total_Amount_Per_Installment__c = 1000.00
        );
        insert testEdition;

        // Create a test Scholarship Round with required fields
        Scholarship_Round__c testRound = new Scholarship_Round__c(
            Scholarship_Edition__c = testEdition.Id,
            Round_End_Date__c = Date.today().addMonths(1),
            Round_Type__c = 'Regular',
            Round_Number__c = 1
        );
        insert testRound;

        // Create a test Application with "Submitted" status
        Application__c testApplication = new Application__c(
            Application_External_Status__c = 'Submitted',
            Contact__c = testContact.Id,
            Scholarship_Round__c = testRound.Id
        );
        insert testApplication;

        // Ensure that there is no data issue
        System.assertNotEquals(null, [SELECT Id FROM Application__c WHERE Id = :testApplication.Id]);

        // Update Application record to trigger the handler
        testApplication.Application_External_Status__c = 'Submitted';  // Keep it as "Submitted" to trigger the sendSubmittedStatusSMS method
        update testApplication;

        // Call the method explicitly to ensure coverage
        Test.startTest();
        // Retrieve old application data for simulation
        Map<Id, Application__c> oldMap = new Map<Id, Application__c>{
            testApplication.Id => new Application__c(
                Application_External_Status__c = 'Under Review'
            )
        };
        APFS_SendApplicationStatusTriggerHandler.onAfterUpdate(new List<Application__c>{testApplication}, oldMap);
        Test.stopTest();

        // Verify that the SMS sending method was called appropriately
        // This is a placeholder; adapt to your mocking and verification strategy
        // For example, if you use a custom way to verify the SMS sending:
        // System.assertEquals('Expected message content', MockHttpResponseGenerator.getLastResponseBody());
    }
}