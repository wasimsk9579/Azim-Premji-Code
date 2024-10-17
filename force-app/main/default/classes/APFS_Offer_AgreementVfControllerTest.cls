@isTest
public class APFS_Offer_AgreementVfControllerTest {

    @testSetup
    static void setupTestData() {
        // Create a Contact record
        Contact testContact = new Contact(
            FirstName = 'Test',
            LastName = 'User',
            Father_Full_Name__c = 'Father Name',
            Mother_Full_Name__c = 'Mother Name',
            Email = 'testuser@example.com',
            MobilePhone = '1234567890',
            Full_Address__c = 'Test Address'
        );
        insert testContact;

       Scholarship__c scholarship = new Scholarship__c(Scholarship_Name__c = 'Test Scholarship');
        insert scholarship;

        Scholarship_Edition__c activeEdition = new Scholarship_Edition__c(
            Scholarship__c = scholarship.Id,
            Total_Amount_Per_Installment__c = 3000,
            Number_Of_Installments_Per_Year__c = 3,
            Offer_Start_Month__c='February',
            Year__c = '2024',
            Is_Active_Edition__c = true
        );
        insert activeEdition;

        Scholarship_Round__c scholarRound = new Scholarship_Round__c(
            Is_Active_Round__c = true,
            Round_End_Date__c = Date.today().addDays(30),
            Round_Type__c = 'Regular',
            Round_Number__c = 1,
            Scholarship_Edition__c = activeEdition.Id
        );
        insert scholarRound;

        // Create an Application record related to the Contact
        Application__c testApplication = new Application__c(
            Contact__c = testContact.Id,
            Scholarship_Round__c = scholarRound.Id,
            Application_External_Status__c = 'Draft'
        );
        insert testApplication;

        // Create an Offer__c record linked to the Application
        Offer__c testOffer = new Offer__c(
            Application__c = testApplication.Id,
            Offer_Start_Date__c = Date.today().addYears(-1),
            Offer_End_Date__c = Date.today().addYears(3),
            Net_Course_Duration__c = 4,
            Current_Offer__c=true
        );
        insert testOffer;
    }

    @isTest
    static void testAPFS_Offer_AgreementVfController() {
        // Set the application Id as a parameter
        Application__c testApplication = [SELECT Id,Name FROM Application__c LIMIT 1];
        ApexPages.currentPage().getParameters().put('id', testApplication.Id);

        // Instantiate the controller
        APFS_Offer_AgreementVfController controller = new APFS_Offer_AgreementVfController();
        
        // Test application retrieval
        System.assertNotEquals(null, controller.application, 'Application record should be retrieved');
        System.assertNotEquals(null, controller.application.Name, 'Application Name should not be null');
        
        // Test contact retrieval
        System.assertNotEquals(null, controller.contactRecord, 'Contact record should be retrieved');
        System.assertEquals('Test', controller.contactRecord.FirstName, 'First Name should match');
        System.assertEquals('User', controller.contactRecord.LastName, 'Last Name should match');
        System.assertEquals('Father Name', controller.contactRecord.Father_Full_Name__c, 'Father name should match');
        System.assertEquals('Mother Name', controller.contactRecord.Mother_Full_Name__c, 'Mother name should match');
        System.assertEquals('testuser@example.com', controller.contactRecord.Email, 'Email should match');
        System.assertEquals('1234567890', controller.contactRecord.MobilePhone, 'Phone should match');
        System.assertEquals('Test Address', controller.contactRecord.Full_Address__c, 'Address should match');

        // Test offers retrieval
        System.assertNotEquals(null, controller.offers, 'Offer record should be retrieved');
       System.assertEquals(9000, controller.offers.Scholarship_Amount_Per_Annum__c, 'Scholarship Amount should match');
        
        // Test calculated fields
        System.assertEquals(4, controller.noOfYear, 'Net Course Duration should match');
       System.assertEquals(9000, controller.scholarshipamount, 'Scholarship Amount per Installment should match');
    }
}