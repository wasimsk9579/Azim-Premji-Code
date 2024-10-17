@isTest
public class APFS_ScholarshipControllerTest {

    private static void createTestData() {
        Integer currentYear = Date.today().year();
        String nextYear = String.valueOf(currentYear + 1);
        String thirdYear = String.valueOf(currentYear + 2);
        
        Scholarship__c testScholarship = new Scholarship__c(
        Scholarship_Name__c = 'Test Scholarship',
        Is_Active__c = true
        );
        insert testScholarship;

        Scholarship_Edition__c testEdition = new Scholarship_Edition__c(
            Scholarship__c = testScholarship.Id,
            Number_Of_Installments_Per_Year__c = 12, // Example value, adjust as per your schema
            Total_Amount_Per_Installment__c = 1000.00,
            	Year__c=nextYear,
            Is_Active_Edition__c = true
        );
        insert testEdition;

        Scholarship_Round__c testRound = new Scholarship_Round__c(
            Scholarship_Edition__c = testEdition.Id,
            Is_Active_Round__c = true,
            Round_End_Date__c = Date.today().addDays(30),
            Round_Type__c = 'Regular',
            Round_Number__c = 1
        );
        insert testRound;
    }

    @isTest
    static void testGetActiveScholarships() {
        createTestData();

        Test.startTest();
        List<Map<String, Object>> scholarships = APFS_ScholarshipController.getActiveScholarships();
        Test.stopTest();

        System.assertNotEquals(null, scholarships, 'Scholarships list should not be null');
        System.assertEquals(1, scholarships.size(), 'There should be one active scholarship with an active edition and round');

        Map<String, Object> scholarship = scholarships[0];
        System.assertEquals('Test Scholarship', scholarship.get('scholarshipName'), 'Scholarship name should match');
        System.assertNotEquals(null, scholarship.get('editionId'), 'Edition ID should not be null');
        System.assertNotEquals(null, scholarship.get('roundId'), 'Round ID should not be null');
        System.assertEquals('Regular', scholarship.get('roundType'), 'Round type should match');
        System.assertNotEquals(null, scholarship.get('roundEndDate'), 'Round end date should not be null');
        System.assertEquals(1, scholarship.get('roundNumber'), 'Round number should match');
    }
}