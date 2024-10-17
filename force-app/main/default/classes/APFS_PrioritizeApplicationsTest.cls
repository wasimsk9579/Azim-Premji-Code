@isTest
public class APFS_PrioritizeApplicationsTest {
    
    @isTest
    static void testGetActiveScholarshipDetails() {
        // Setup test data
       Scholarship__c scholarship = new Scholarship__c(Scholarship_Name__c = 'Test Scholarship', Is_Active__c = true);
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
        List<Map<String, Object>> results = APFS_PrioritizeApplications.getActiveScholarshipDetails('Test Scholarship', activeEdition.Name, scholarRound.Name);
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
    static void testFetchPrioritizeRecords() {
        // Setup test data
        Contact contact = new Contact(
            FirstName = 'Tese3t',
            LastName = 'Contaect',
            Email = 'testcontact@example.com',
            MobilePhone = '9053456784',
            Class_Twelve_Exam_Centre_State__c = 'Test State',
            Class_Twelve_Exam_Centre_District__c = 'Test District',
            Referred_By_APF_Or_Partners__c = 'Yes'
        );
        insert contact;
        Scholarship__c scholarship = new Scholarship__c(
            Scholarship_Name__c = 'Test Scholarship Name',
            Is_Active__c = true
        );
        insert scholarship;

        Scholarship_Edition__c edition = new Scholarship_Edition__c(
            Is_Active_Edition__c = true,
            Total_Amount_Per_Installment__c = 300000,
            Number_Of_Installments_Per_Year__c = 3,
            Year__c = '2024',
            Scholarship__c = scholarship.Id
        );
        insert edition;

        Scholarship_Round__c round = new Scholarship_Round__c(
            Is_Active_Round__c = true,
            Round_End_Date__c = Date.today().addDays(30),
            Round_Type__c = 'Regular',
            Round_Number__c = 1,
            Scholarship_Edition__c = edition.Id
        );
        insert round;

        Application__c app = new Application__c(
    		Contact__c = contact.Id, 
            Scholarship_Round__c = round.Id,
            Application_External_Status__c = 'Draft',
            Application_Internal_Status__c = 'Submitted',
            Submission_Date__c = DateTime.now()
        );
        insert app;

        // Call the method
        Test.startTest();
        List<Application__c> results = APFS_PrioritizeApplications.fetchPrioritizeRecords(scholarship.Id, 'Submitted', 'Test State', 'Test District', 'Yes',1,app.Id);
        Test.stopTest();

        // Assertions
       //System.assertEquals(1, results.size());
       //System.assertEquals(app.Id, results[0].Id);
    }

    @isTest
    static void testFetchOfferApprovedRecords() {
        // Setup test data
        Contact contact = new Contact(
            FirstName = 'Tese3t',
            LastName = 'Contaect',
            Email = 'testcontact@example.com',
            MobilePhone = '9053456784',
            Class_Twelve_Exam_Centre_State__c = 'Test State',
            Class_Twelve_Exam_Centre_District__c = 'Test District',
            Referred_By_APF_Or_Partners__c = 'Yes'
        );
        insert contact;
        Scholarship__c scholarship = new Scholarship__c(
            Scholarship_Name__c = 'Test Scholarship Name',
            Is_Active__c = true
        );
        insert scholarship;

        Scholarship_Edition__c edition = new Scholarship_Edition__c(
            Is_Active_Edition__c = true,
            Total_Amount_Per_Installment__c = 300000,
            Number_Of_Installments_Per_Year__c = 3,
            Year__c = '2024',
            Scholarship__c = scholarship.Id
        );
        insert edition;

        Scholarship_Round__c round = new Scholarship_Round__c(
            Is_Active_Round__c = true,
            Round_End_Date__c = Date.today().addDays(30),
            Round_Type__c = 'Regular',
            Round_Number__c = 1,
            Scholarship_Edition__c = edition.Id
        );
        insert round;

        Application__c app = new Application__c(
    		Contact__c = contact.Id, 
            Application_Internal_Status__c = 'Verification Cleared',
            Application_External_Status__c = 'Draft',
            Scholarship_Round__c = round.Id,
            Submission_Date__c = DateTime.now()

        );
        insert app;

        // Call the method
        Test.startTest();
        List<Application__c> results = APFS_PrioritizeApplications.fetchOfferApprovedRecords(
            scholarship.Id, 
            'Verification Cleared', 
            'Test State', 
            'Test District', 
            'Yes',1,app.Id
        );
        Test.stopTest();

        // Assertions
        //System.assertEquals(1, results.size());
        //System.assertEquals(app.Id, results[0].Id);
    }

    @isTest
    static void testFetchDisbursalApprovalRecords() {
        // Setup test data
        Contact contact = new Contact(
            FirstName = 'Tese3t',
            LastName = 'Contaect',
            Email = 'testcontact@example.com',
            MobilePhone = '9053456784',
            Class_Twelve_Exam_Centre_State__c = 'Test State',
            Class_Twelve_Exam_Centre_District__c = 'Test District',   
            Referred_By_APF_Or_Partners__c = 'Yes'   
        );
        insert contact;
        Scholarship__c scholarship = new Scholarship__c(
            Scholarship_Name__c = 'Test Scholarship Name',
            Is_Active__c = true
        );
        insert scholarship;

        Scholarship_Edition__c edition = new Scholarship_Edition__c(
            Is_Active_Edition__c = true,
            Total_Amount_Per_Installment__c = 300000,
            Number_Of_Installments_Per_Year__c = 3,
            Year__c = '2024',
            Scholarship__c = scholarship.Id
        );
        insert edition;

        Scholarship_Round__c round = new Scholarship_Round__c(
            Is_Active_Round__c = true,
            Round_End_Date__c = Date.today().addDays(30),
            Round_Type__c = 'Regular',
            Round_Number__c = 1,
            Scholarship_Edition__c = edition.Id
        );
        insert round;

        Application__c app = new Application__c(
    		Contact__c = contact.Id, 
            Application_Internal_Status__c = 'Offer Verification Cleared',
            Application_External_Status__c = 'Draft',
            Submission_Date__c = DateTime.now(),
            Scholarship_Round__c = round.Id
        );
        insert app;

        // Call the method
        Test.startTest();
        List<Application__c> results = APFS_PrioritizeApplications.fetchDisbursalApprovalRecords(
            scholarship.Id, 
            'Offer Verification Cleared', 
            'Test State', 
            'Test District', 
            'Yes',1,app.Id
        );
        Test.stopTest();

        // Assertions
        //System.assertEquals(1, results.size());
        //System.assertEquals(app.Id, results[0].Id);
    }

    @isTest
    static void testFetchVerificationRecords() {
        // Setup test data
        Contact contact = new Contact(
            FirstName = 'Tese3t',
            LastName = 'Contaect',
            Email = 'testcontact@example.com',
            MobilePhone = '9053456784',
            Class_Twelve_Exam_Centre_State__c = 'Test State',
            Class_Twelve_Exam_Centre_District__c = 'Test District',
            Referred_By_APF_Or_Partners__c = 'Yes'
        );
        insert contact;
        Scholarship__c scholarship = new Scholarship__c(
            Scholarship_Name__c = 'Test Scholarship Name',
            Is_Active__c = true
        );
        insert scholarship;

        Scholarship_Edition__c edition = new Scholarship_Edition__c(
            Is_Active_Edition__c = true,
            Total_Amount_Per_Installment__c = 300000,
            Number_Of_Installments_Per_Year__c = 3,
            Year__c = '2024',
            Scholarship__c = scholarship.Id
        );
        insert edition;

        Scholarship_Round__c round = new Scholarship_Round__c(
            Is_Active_Round__c = true,
            Round_End_Date__c = Date.today().addDays(30),
            Round_Type__c = 'Regular',
            Round_Number__c = 1,
            Scholarship_Edition__c = edition.Id
        );
        insert round;

        Application__c app = new Application__c(
    		Contact__c = contact.Id, 
            Application_Internal_Status__c = 'Verification Cleared',
            Scholarship_Round__c = round.Id,
            Application_External_Status__c = 'Draft',
            Submission_Date__c = DateTime.now()
        );
        insert app;

        // Call the method
        Test.startTest();
        List<Application__c> results = APFS_PrioritizeApplications.fetchVerificationRecords(scholarship.Id,'Verification Cleared', 'Test State', 'Test District', 'Yes',1,app.Id);
        Test.stopTest();

        // Assertions
        //System.assertEquals(1, results.size());
        //System.assertEquals(app.Id, results[0].Id);
    }

    @isTest
    static void testUpdateApplicationStatus() {
        // Setup test data
        Contact contact = new Contact(
            FirstName = 'Tese3t',
            LastName = 'Contaect',
            Email = 'testcontact@example.com',
            MobilePhone = '9053456784',
            Class_Twelve_Exam_Centre_State__c = 'Test State',
            Class_Twelve_Exam_Centre_District__c = 'Test District',
            Referred_By_APF_Or_Partners__c = 'Yes'
        );
        insert contact;
        Scholarship__c scholarship = new Scholarship__c(
            Scholarship_Name__c = 'Test Scholarship Name',
            Is_Active__c = true
        );
        insert scholarship;

        Scholarship_Edition__c edition = new Scholarship_Edition__c(
            Is_Active_Edition__c = true,
            Total_Amount_Per_Installment__c = 300000,
            Number_Of_Installments_Per_Year__c = 3,
            Year__c = '2024',
            Scholarship__c = scholarship.Id
        );
        insert edition;

        Scholarship_Round__c round = new Scholarship_Round__c(
            Is_Active_Round__c = true,
            Round_End_Date__c = Date.today().addDays(30),
            Round_Type__c = 'Regular',
            Round_Number__c = 1,
            Scholarship_Edition__c = edition.Id
        );
        insert round;

        Application__c app = new Application__c(
    		Contact__c = contact.Id, 
            Application_Internal_Status__c = 'Submitted',
            Application_External_Status__c = 'Draft',
            Submission_Date__c = DateTime.now(),
            Scholarship_Round__c = round.Id
        );
        insert app;

        List<Id> recordIds = new List<Id>{app.Id};
        String internalStatus = 'Not Selected';
        String rejectedReason = 'Inconsistencies in documents submitted';
        String comment = 'Test Comment';

        // Call the method
        Test.setMock(HttpCalloutMock.class, new MockHttpResponseGenerator());
        Test.startTest();
        APFS_PrioritizeApplications.updateApplicationStatus(recordIds, internalStatus, rejectedReason, comment);
        Test.stopTest();

        // Refresh data and assertions
        app = [SELECT Application_Internal_Status__c FROM Application__c WHERE Id = :app.Id];
        System.assertEquals(internalStatus, app.Application_Internal_Status__c);

        // Check for the status comment
        List<Application_Status_Comment__c> comments = [
            SELECT Id, Application__c, Comment__c 
            FROM Application_Status_Comment__c 
            WHERE Application__c = :app.Id
        ];
        System.assertEquals(1, comments.size());
        System.assertEquals(comment, comments[0].Comment__c);
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
}