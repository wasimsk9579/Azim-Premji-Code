@isTest
public class APFS_OfferApplicationsTest {
    @testSetup
    static void setup() {
        // Create test data
        Contact testContact = new Contact(
            FirstName = 'Test',
            LastName = 'User',
            Email = 'testuser@example.com',
            MobilePhone = '1234567890',
            Class_Twelve_Exam_Centre_State__c = 'Test State',
            Class_Twelve_Exam_Centre_District__c = 'Test District',
            Referred_By_APF_Or_Partners__c = 'Yes'
        );
        insert testContact;

        Scholarship__c testScholarship = new Scholarship__c(
            Scholarship_Name__c = 'Test Scholarship',
            Is_Active__c = true
        );
        insert testScholarship;

        Scholarship_Edition__c testEdition = new Scholarship_Edition__c(
            Is_Active_Edition__c = true,
            Total_Amount_Per_Installment__c = 300000,
            Number_Of_Installments_Per_Year__c = 3,
            Year__c = '2024',
            Scholarship__c = testScholarship.Id
        );
        insert testEdition;

        Scholarship_Round__c testRound = new Scholarship_Round__c(
            Is_Active_Round__c = true,
            Round_End_Date__c = Date.today().addDays(30),
            Round_Type__c = 'Regular',
            Round_Number__c = 1,
            Scholarship_Edition__c = testEdition.Id
        );
        insert testRound;

        Application__c testApplication = new Application__c(
            Contact__c = testContact.Id,
            Scholarship_Round__c = testRound.Id,
            Application_External_Status__c = 'Draft',
            Application_Internal_Status__c = 'Submitted',
            Submission_Date__c = DateTime.now()
        );
        insert testApplication;

        Offer__c testOffer = new Offer__c(
            Application__c = testApplication.Id,
            Current_Offer__c = true
        );
        insert testOffer;
       
    }

     @isTest
    static void testGetActiveScholarshipDetails() {
        // Setup test data
       Scholarship__c scholarship = new Scholarship__c(Scholarship_Name__c = 'Test Scholarship1', Is_Active__c = true);
        insert scholarship;
        String scholarshipName = scholarship.Scholarship_Name__c;
        Scholarship_Edition__c activeEdition = new Scholarship_Edition__c(
            Scholarship__c = scholarship.Id,
            Total_Amount_Per_Installment__c = 300000,
            Number_Of_Installments_Per_Year__c = 3,
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
        
        List<Scholarship_Edition__c> editions = [SELECT Id, Name FROM Scholarship_Edition__c WHERE Id = :activeEdition.Id LIMIT 1];
        activeEdition = editions.isEmpty() ? null : editions[0];
        
        List<Scholarship_Round__c> rounds = [SELECT Id, Name FROM Scholarship_Round__c WHERE Id = :scholarRound.Id LIMIT 1];
        scholarRound = rounds.isEmpty() ? null : rounds[0];

        // Call the method
         Test.startTest();
        List<Map<String, Object>> results = APFS_OfferApplications.getActiveScholarshipDetails('Test Scholarship1', activeEdition.Name, scholarRound.Name);
        Test.stopTest();

        // Assertions
        System.assertEquals(1, results.size(), 'Expected one scholarship detail record.');
        System.assertEquals(scholarship.Id, results[0].get('scholarshipId'), 'Scholarship ID does not match.');
        System.assertEquals(scholarship.Scholarship_Name__c, results[0].get('scholarshipName'), 'Scholarship name does not match.');
        System.assertEquals(activeEdition.Id, results[0].get('editionId'), 'Edition ID does not match.');
        System.assertEquals(activeEdition.Name, results[0].get('editionName'), 'Edition name does not match.');
        System.assertEquals(scholarRound.Id, results[0].get('roundId'), 'Round ID does not match.');
    }

    @isTest
    static void testGetApplicationsByOffer() {
        // Setup
        Offer__c testOffer = [SELECT Id FROM Offer__c LIMIT 1];
        
        Test.startTest();
        Offer__c result = APFS_OfferApplications.getApplicationsByOffer(testOffer.Id);
        Test.stopTest();

        // Assertions
        System.assertNotEquals(null, result, 'Expected an offer record.');
        System.assertEquals(testOffer.Id, result.Id, 'Offer ID does not match.');
    }

    @isTest
    static void testFetchApplicationWithLatestOffer() {
        // Test parameters
        Id scholarshipId = [SELECT Id FROM Scholarship__c LIMIT 1].Id;
        Id applicationId = [SELECT Id FROM Application__c LIMIT 1].Id;
        
        Test.startTest();
        List<Application__c> results = APFS_OfferApplications.fetchApplicationWithLatestOffer(scholarshipId, 'Submitted', 'Test State', 'Test District', 'Yes', 1, applicationId);
        Test.stopTest();

        // Assertions
        //System.assertEquals(1, results.size(), 'Expected one application record.');
    }

    @isTest
    static void testFetchApplicationWithVerification() {
        // Test parameters
        Id scholarshipId = [SELECT Id FROM Scholarship__c LIMIT 1].Id;
        Id applicationId = [SELECT Id FROM Application__c LIMIT 1].Id;

        Test.startTest();
        List<Application__c> results = APFS_OfferApplications.fetchApplicationWithVerification(scholarshipId, 'Submitted', 'Test State', 'Test District', 'Yes', 1, applicationId);
        Test.stopTest();

        // Assertions
        //System.assertEquals(1, results.size(), 'Expected one application record.');
    }
     @isTest
    static void testGetOfferApplicationAdmissionDetails() {
        // Create test data
        Contact testContact = new Contact(
            FirstName = 'John',
            LastName = 'Doe',
            Class_Twelve_Year_Of_Passing__c = '2023',
            Class_Twelve_Exam_Centre_State__c = 'State A',
            Class_Twelve_Exam_Centre_District__c = 'District A',
            Class_Ten_Year_Of_Passing__c = '2021',
            Class_Ten_Exam_Centre_State__c = 'State B',
            Class_Ten_Exam_Centre_District__c = 'District B'
        );
        insert testContact;
        Scholarship__c testScholarship = new Scholarship__c(
            Scholarship_Name__c = 'Test Scholarship',
            Is_Active__c = true
        );
        insert testScholarship;

        Scholarship_Edition__c testEdition = new Scholarship_Edition__c(
            Is_Active_Edition__c = true,
            Total_Amount_Per_Installment__c = 300000,
            Number_Of_Installments_Per_Year__c = 3,
            Year__c = '2024',
            Scholarship__c = testScholarship.Id
        );
        insert testEdition;

        Scholarship_Round__c testRound = new Scholarship_Round__c(
            Is_Active_Round__c = true,
            Round_End_Date__c = Date.today().addDays(30),
            Round_Type__c = 'Regular',
            Round_Number__c = 1,
            Scholarship_Edition__c = testEdition.Id
        );
        insert testRound;


        Application__c testApplication = new Application__c(
            Contact__c = testContact.Id,
            Scholarship_Round__c = testRound.Id,
            Application_External_Status__c = 'Draft'
        );
        insert testApplication;

        Offer__c testOffer = new Offer__c(
            Application__c = testApplication.Id,
            Current_Offer__c = true,
            Offer_Start_Date__c = Date.today(),
            Offer_End_Date__c = Date.today().addDays(30),
            Net_Course_Duration__c = 2
        );
        insert testOffer;

        Admission__c testAdmission = new Admission__c(
            Application__c = testApplication.Id,
            Contact__c = testContact.Id,
            Is_Active__c = true,
            Name_Of_The_Institute__c = 'Test Institute',
            Institute_State__c = 'State C',
            Institute_District__c = 'District C',
            Course_Name__c = 'Test Course',
            Course_Duration_In_Years__c = '3',
            Course_Year_Of_Studying__c = '1'
        );
        insert testAdmission;

        Test.startTest();
        Application__c result = APFS_OfferApplications.getOfferApplicationAdmissionDetails(testApplication.Id);
        Test.stopTest();

        System.assertNotEquals(null, result, 'The application result should not be null.');
        System.assertEquals(testContact.Id, result.Contact__c, 'The contact ID should match.');
        System.assertEquals(testContact.Class_Twelve_Year_Of_Passing__c, result.Contact__r.Class_Twelve_Year_Of_Passing__c, 'Class 12 year of passing should match.');
        System.assertEquals('Test Institute', result.Admissions__r[0].Name_Of_The_Institute__c, 'The institute name should match.');
    }
}