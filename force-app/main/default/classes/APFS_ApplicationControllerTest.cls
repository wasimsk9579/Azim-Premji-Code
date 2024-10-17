/**
 * @description       : Test class for APFS_ApplicationController to check the functionality of the class
 * @author            : 
 * @last modified on  : 21-07-2024
 * @last modified by  : 
 **/


@isTest
public class APFS_ApplicationControllerTest {

    @isTest
    static void testHasAppliedForScholarship_WithExistingApplication() {
     UserRole userrole = [Select Id, DeveloperName From UserRole Where DeveloperName = 'Scholarship_Portal_Account_Owner' Limit 1];
     User adminUser = [Select Id, UserRoleId From User Where Profile.Name='System Administrator' Limit 1];
	 
        adminUser.UserRoleId = userRole.Id;
        adminUser.Isactive = true;
     update adminUser;

     System.runAs(adminUser){
         Account acc = new account(
            Name='testPortal'
         );
           insert acc;
        	Contact Con = new Contact(
            FirstName = 'Tese3t',
            LastName = 'Contaect',
            Email = 'testcontact@example.com',
            MobilePhone	= '9053456784',
            AccountId = acc.Id
        );
        
        insert Con;
       
        Scholarship__c scholarship = new Scholarship__c(Scholarship_Name__c = 'Test Scholarship');
        insert scholarship;

        Scholarship_Edition__c activeEdition = new Scholarship_Edition__c(
            Scholarship__c = scholarship.Id,
            Total_Amount_Per_Installment__c = 300000,
            Number_Of_Installments_Per_Year__c = 3,
            Year__c = '2024',
            Is_Active_Edition__c = true,
            Offer_Start_Month__c = 'January'
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
        Application__c testApplication = new Application__c(
            Contact__c = Con.Id,
            Scholarship_Round__c = scholarRound.Id,
            Application_External_Status__c = 'Draft',
            Submission_Date__c = DateTime.now()
        );
        insert testApplication;
     }
        Contact testContact = [SELECT Id FROM Contact WHERE Email = 'testcontact@example.com' LIMIT 1];
        Scholarship_Round__c testRound = [SELECT Id FROM Scholarship_Round__c LIMIT 1];
    
        User testUser;
        System.runAs(testUser = createTestUser(testContact.Id)) {
            Test.setMock(HttpCalloutMock.class, new MockHttpResponseGenerator());
            Test.startTest();
            Application__c existingApplication = APFS_ApplicationController.hasAppliedForScholarship(testUser.Id, testRound.Id);
            Test.stopTest();
            System.assertNotEquals(null, existingApplication, 'Application should exist.');
        }
    }

    @isTest
    static void testHasAppliedForScholarship_WithNoExistingApplication() {
     UserRole userrole = [Select Id, DeveloperName From UserRole Where DeveloperName = 'Scholarship_Portal_Account_Owner' Limit 1];
     User adminUser = [Select Id, UserRoleId From User Where Profile.Name='System Administrator' Limit 1];
	 
        adminUser.UserRoleId = userRole.Id;
        adminUser.Isactive = true;
     update adminUser;

     System.runAs(adminUser){
         Account acc = new account(
            Name='testPortal1'
         );
            insert acc;
       		Contact Con = new Contact(
            FirstName = 'Test',
            LastName = 'Contact1',
            Email = 'testcontact1@example.com',
            MobilePhone	= '9053456783',
            AccountId = acc.Id
        );
        
        insert Con;
       
        Scholarship__c scholarship = new Scholarship__c(Scholarship_Name__c = 'Test Scholarship 1');
        insert scholarship;

        Scholarship_Edition__c activeEdition = new Scholarship_Edition__c(
            Scholarship__c = scholarship.Id,
            Total_Amount_Per_Installment__c = 300000,
            Number_Of_Installments_Per_Year__c = 3,
            Year__c = '2024',
            Is_Active_Edition__c = true,
            Offer_Start_Month__c = 'January'
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
     }
        Contact testContact = [SELECT Id FROM Contact WHERE Email = 'testcontact1@example.com' LIMIT 1];
        Scholarship_Round__c testRound = [SELECT Id FROM Scholarship_Round__c LIMIT 1];
    
        User testUser;
        System.runAs(testUser = createTestUser(testContact.Id)) {
             Test.setMock(HttpCalloutMock.class, new MockHttpResponseGenerator());
            Test.startTest();
            Application__c notExistingApplication = APFS_ApplicationController.hasAppliedForScholarship(testUser.Id, testRound.Id);
            Test.stopTest();

            System.assertEquals(null, notExistingApplication, 'Application should not exist.');
        }
    }

    @isTest
    static void testCreateApplication_Success() {
     UserRole userrole = [Select Id, DeveloperName From UserRole Where DeveloperName = 'Scholarship_Portal_Account_Owner' Limit 1];
     User adminUser = [Select Id, UserRoleId From User Where Profile.Name='System Administrator' Limit 1];
	 
        adminUser.UserRoleId = userRole.Id;
        adminUser.Isactive = true;
     update adminUser;

     System.runAs(adminUser){
         Account acc = new account(
            Name='testPortal2'
         );
           insert acc;
        Contact Con = new Contact(
            FirstName = 'Test',
            LastName = 'Contact2',
            Email = 'testcontact2@example.com',
            MobilePhone	= '9053456788',
            AccountId = acc.Id
        );
        
        insert Con;
       
        Scholarship__c scholarship = new Scholarship__c(Scholarship_Name__c = 'Test Scholarship 2');
        insert scholarship;

        Scholarship_Edition__c activeEdition = new Scholarship_Edition__c(
            Scholarship__c = scholarship.Id,
            Total_Amount_Per_Installment__c = 300000,
            Number_Of_Installments_Per_Year__c = 3,
            Year__c = '2024',
            Is_Active_Edition__c = true,
            Offer_Start_Month__c = 'January'
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
     }
        Contact testContact = [SELECT Id FROM Contact WHERE Email = 'testcontact2@example.com' LIMIT 1];
        Scholarship_Round__c testRound = [SELECT Id FROM Scholarship_Round__c LIMIT 1];
    
        User testUser;
        System.runAs(testUser = createTestUser(testContact.Id)) {
             Test.setMock(HttpCalloutMock.class, new MockHttpResponseGenerator());
            Test.startTest();
            Application__c createApplication = APFS_ApplicationController.createApplication(testUser.Id, testRound.Id);
            Test.stopTest();

            System.assertNotEquals(null, createApplication, 'Application should be created.');
            System.assertEquals(testContact.Id, createApplication.Contact__c, 'Contact ID should match.');
            System.assertEquals(testRound.Id, createApplication.Scholarship_Round__c, 'Scholarship Round ID should match.');
            System.assertEquals('Draft', createApplication.Application_External_Status__c, 'Status should be Draft.');
        }
    }

   @isTest
static void testCreateApplication_AlreadyApplied() {
    UserRole userrole = [SELECT Id, DeveloperName FROM UserRole WHERE DeveloperName = 'Scholarship_Portal_Account_Owner' LIMIT 1];
    User adminUser = [SELECT Id, UserRoleId FROM User WHERE Profile.Name = 'System Administrator' LIMIT 1];

    adminUser.UserRoleId = userrole.Id;
    adminUser.IsActive = true;
    update adminUser;

    System.runAs(adminUser) {
        Account acc = new Account(Name = 'testPortal2');
        insert acc;

        Contact con = new Contact(
            FirstName = 'Test',
            LastName = 'Contact2',
            Email = 'testcontact2@example.com',
            MobilePhone = '9053456788',
            AccountId = acc.Id
        );
        insert con;

        Scholarship__c scholarship = new Scholarship__c(Scholarship_Name__c = 'Test Scholarship 2');
        insert scholarship;

        Scholarship_Edition__c activeEdition = new Scholarship_Edition__c(
            Scholarship__c = scholarship.Id,
            Total_Amount_Per_Installment__c = 300000,
            Number_Of_Installments_Per_Year__c = 3,
            Year__c = '2024',
            Is_Active_Edition__c = true,
            Offer_Start_Month__c = 'January'
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

        Application__c existingApplication = new Application__c(
            Contact__c = con.Id,
            Scholarship_Round__c = scholarRound.Id,
            Application_External_Status__c = 'Draft',
            Submission_Date__c = DateTime.now()
        );
        insert existingApplication;
    }

    Contact testContact = [SELECT Id FROM Contact WHERE Email = 'testcontact2@example.com' LIMIT 1];
    Scholarship_Round__c testRound = [SELECT Id FROM Scholarship_Round__c LIMIT 1];

    User testUser;
    System.runAs(testUser = createTestUser(testContact.Id)) {
        Test.setMock(HttpCalloutMock.class, new MockHttpResponseGenerator());
        Test.startTest();
        try {
            APFS_ApplicationController.createApplication(testUser.Id, testRound.Id);
            System.assert(false, 'Exception should have been thrown.');
        } catch (APFS_CustomException e) {
            // Use the actual message thrown
            System.assertEquals('Error creating application: User has already applied for this scholarship.', e.getMessage(), 'Exception message should match.');
        }
        Test.stopTest();
    }
}
    
    @isTest
static void testHasActiveOffer_WithActiveOffer() {
    UserRole userRole = [SELECT Id FROM UserRole WHERE DeveloperName = 'Scholarship_Portal_Account_Owner' LIMIT 1];
    User adminUser = [SELECT Id, UserRoleId FROM User WHERE Profile.Name = 'System Administrator' LIMIT 1];

    adminUser.UserRoleId = userRole.Id;
    adminUser.IsActive = true;
    update adminUser;

    System.runAs(adminUser) {
        Account acc = new Account(Name = 'testPortalOffer');
        insert acc;

        Contact con = new Contact(
            FirstName = 'Test',
            LastName = 'ContactOffer',
            Email = 'testcontactoffer@example.com',
            MobilePhone = '9053456789',
            AccountId = acc.Id
        );
        insert con;

        Scholarship__c scholarship = new Scholarship__c(Scholarship_Name__c = 'Test Scholarship Offer');
        insert scholarship;

        Scholarship_Edition__c activeEdition = new Scholarship_Edition__c(
            Scholarship__c = scholarship.Id,
            Total_Amount_Per_Installment__c = 300000,
            Number_Of_Installments_Per_Year__c = 3,
            Year__c = '2024',
            Is_Active_Edition__c = true,
            Offer_Start_Month__c = 'January'
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

        Application__c application = new Application__c(
            Contact__c = con.Id,
            Scholarship_Round__c = scholarRound.Id,
            Application_External_Status__c = 'Draft',
            Submission_Date__c = DateTime.now()
        );
        insert application;

        // Create an active offer associated with the application
        Offer__c activeOffer = new Offer__c(
            Application__c = application.Id,
            Current_Offer__c = true
        );
        insert activeOffer;
    }

    Contact testContact = [SELECT Id FROM Contact WHERE Email = 'testcontactoffer@example.com' LIMIT 1];
    Application__c testApplication = [SELECT Id FROM Application__c WHERE Contact__c = :testContact.Id LIMIT 1];

    User testUser;
    System.runAs(testUser = createTestUser(testContact.Id)) {
        Test.setMock(HttpCalloutMock.class, new MockHttpResponseGenerator());
        Test.startTest();
        Boolean hasActiveOffer = APFS_ApplicationController.hasActiveOffer(testApplication.Id);
        Test.stopTest();

        System.assertEquals(true, hasActiveOffer, 'There should be an active offer associated with the application.');
    }
}

@isTest
static void testHasActiveOffer_WithNoActiveOffer() {
    UserRole userRole = [SELECT Id FROM UserRole WHERE DeveloperName = 'Scholarship_Portal_Account_Owner' LIMIT 1];
    User adminUser = [SELECT Id, UserRoleId FROM User WHERE Profile.Name = 'System Administrator' LIMIT 1];

    adminUser.UserRoleId = userRole.Id;
    adminUser.IsActive = true;
    update adminUser;

    System.runAs(adminUser) {
        Account acc = new Account(Name = 'testPortalNoOffer');
        insert acc;

        Contact con = new Contact(
            FirstName = 'Test',
            LastName = 'ContactNoOffer',
            Email = 'testcontactnooffer@example.com',
            MobilePhone = '9053456790',
            AccountId = acc.Id
        );
        insert con;

        Scholarship__c scholarship = new Scholarship__c(Scholarship_Name__c = 'Test Scholarship No Offer');
        insert scholarship;

        Scholarship_Edition__c activeEdition = new Scholarship_Edition__c(
            Scholarship__c = scholarship.Id,
            Total_Amount_Per_Installment__c = 300000,
            Number_Of_Installments_Per_Year__c = 3,
            Year__c = '2024',
            Is_Active_Edition__c = true,
            Offer_Start_Month__c = 'January'
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

        Application__c application = new Application__c(
            Contact__c = con.Id,
            Scholarship_Round__c = scholarRound.Id,
            Application_External_Status__c = 'Draft',
            Submission_Date__c = DateTime.now()
        );
        insert application;
    }

    Contact testContact = [SELECT Id FROM Contact WHERE Email = 'testcontactnooffer@example.com' LIMIT 1];
    Application__c testApplication = [SELECT Id FROM Application__c WHERE Contact__c = :testContact.Id LIMIT 1];

    User testUser;
    System.runAs(testUser = createTestUser(testContact.Id)) {
        Test.setMock(HttpCalloutMock.class, new MockHttpResponseGenerator());
        Test.startTest();
        Boolean hasActiveOffer = APFS_ApplicationController.hasActiveOffer(testApplication.Id);
        Test.stopTest();

        System.assertEquals(false, hasActiveOffer, 'There should be no active offers associated with the application.');
    }
}

    
    
private class MockHttpResponseGenerator implements HttpCalloutMock {
        public HTTPResponse respond(HTTPRequest req) {
            HttpResponse res = new HttpResponse();
            res.setHeader('Content-Type', 'application/json');
            res.setBody('{"status": "success", "message": "SMS sent successfully."}');
            res.setStatusCode(200);
            return res;
        }
    }
    
    private static User createTestUser(Id contactId) {
     
        profile p= [SELECT Id FROM Profile WHERE Name = 'Scholarship Portal Applicant' LIMIT 1];       
        User newUser = new User(
            FirstName = 'Tesjt',
            LastName = 'Usehr',
            ContactId = contactId,
            Email = 'testuseruazim@example.com',
            Username = 'testusher12352@example.com',
            Alias = 'tuseiur',
            ProfileId = p.Id,
            MobilePhone = '7975946497',
            CommunityNickname = 'tesjtuser',
            EmailEncodingKey = 'UTF-8',
            LanguageLocaleKey = 'en_US',
            LocaleSidKey = 'en_US',
            TimeZoneSidKey = 'America/New_York'
            
        );
        insert newUser;

        return newUser;
    }
}