@isTest
public class APFS_AppStatusSubmittedToReviewTest {
    @TestSetup
    static void setup() {
        
        // Create an Account
        Account testAccount = new Account(
            Name = 'Test Account'
        );
        insert testAccount;

        // Create a Contact associated with the Account
        Contact testContact = new Contact(
            FirstName = 'Test',
            LastName = 'User',
            MobilePhone = '7899011797',
            AccountId = testAccount.Id
        );
        insert testContact;
        Contact conData = [SELECT Id, Name, Owner.Name FROM Contact WHERE Id = :testContact.Id];

        // Create a Scholarship (assuming it's required for your application)
        Scholarship__c scholarship = new Scholarship__c(
            Scholarship_Name__c = 'Test Scholarship'
        );
        insert scholarship;

        // Create a Scholarship Edition (assuming it's required for your application)
        Scholarship_Edition__c activeEdition = new Scholarship_Edition__c(
            Scholarship__c = scholarship.Id,
            Total_Amount_Per_Installment__c = 300000,
            Number_Of_Installments_Per_Year__c = 3,
            Year__c = '2024',
            Offer_Start_Month__c = 'January',
            Is_Active_Edition__c = true
        );
        insert activeEdition;

        // Create a Scholarship Round (assuming it's required for your application)
        Scholarship_Round__c scholarRound = new Scholarship_Round__c(
            Is_Active_Round__c = true,
            Round_End_Date__c = Date.today().addDays(30),
            Round_Type__c = 'Regular',
            Round_Number__c = 1,
            Scholarship_Edition__c = activeEdition.Id
        );
        insert scholarRound;

        // Create sample Application__c records with 'Submitted' status
        List<Application__c> apps = new List<Application__c>();
        for (Integer i = 0; i < 10; i++) {
            Application__c app = new Application__c(
                Contact__c = testContact.Id,
                Scholarship_Round__c = scholarRound.Id,
                Application_External_Status__c = 'Submitted',
                Submission_Date__c = DateTime.now()
            );
            apps.add(app);
        }
        insert apps;
    }

    @isTest
    static void testBatchExecution() {
          // Set the mock callout response
        Test.setMock(HttpCalloutMock.class, new MockHttpResponseGenerator());
        // Start the test, setting limits for batch processing
        Test.startTest();

        // Instantiate the batch class and run it
        APFS_AppStatusSubmittedToReview batch = new APFS_AppStatusSubmittedToReview();
        Database.executeBatch(batch, 200);  // Specify a batch size if needed

        Test.stopTest();

        // Query the updated Application__c records
        List<Application__c> updatedApps = [
            SELECT Application_External_Status__c
            FROM Application__c
            WHERE Application_External_Status__c = 'Application Under Review'
        ];

        // Assert that all records have the updated status
        System.assertEquals(10, updatedApps.size(), 'All applications should be updated to "Application Under Review"');
        for (Application__c app : updatedApps) {
            System.assertEquals('Application Under Review', app.Application_External_Status__c, 'The status should be updated.');
        }
    }
}