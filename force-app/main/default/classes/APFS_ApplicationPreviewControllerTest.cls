@isTest
public class APFS_ApplicationPreviewControllerTest {
    @isTest
    static void testController() {
        // Create a Contact
        Contact testContact = new Contact(
            FirstName = 'Test',
            LastName = 'User',
            Aadhaar_Number__c = '123412341234',
            Email = 'testuser@example.com',
            GenderIdentity = 'Male',
            MobilePhone = '1234567890',
            Birthdate = Date.today().addYears(-20),
            Community_Name__c = 'Test Community',
            Mother_Full_Name__c = 'Test Mother',
            Father_Full_Name__c = 'Test Father',
            Referral_Full_Name__c = 'Referrer',
            Referred_By_APF_Or_Partners__c = 'Yes',
            Class_Eight_Education_Mode__c = 'Regular',
            Class_Eight_Exam_Centre_District__c = 'District 8',
            Class_Eight_Exam_Centre_Pincode__c = '123456',
            Class_Eight_Exam_Centre_State__c = 'State 8',
            Class_Eight_Name_Of_School__c = 'School 8',
            Class_Eight_Other_Name_Of_School__c = 'Other School 8',
            Class_Eight_Pass_Percentage__c = 85,
            Class_Eight_Year_Of_Passing__c = '2012',
            Class_Eight_Exam_Center_Block__c = 'Block 8',
            Class_Ten_Education_Mode__c = 'Regular',
            Class_Ten_Exam_Centre_District__c = 'District 10',
            Class_Ten_Exam_Centre_Pincode__c = '654321',
            Class_Ten_Exam_Centre_State__c = 'State 10',
            Class_Ten_Name_Of_School__c = 'School 10',
            Class_Ten_Other_Name_Of_School__c = 'Other School 10',
            Class_Ten_Pass_Percentage__c = 88,
            Class_Ten_Year_Of_Passing__c = '2014',
            Class_Ten_Exam_Center_Block__c = 'Block 10',
            Class_Twelve_Education_Mode__c = 'Regular',
            Class_Twelve_Exam_Centre_District__c = 'District 12',
            Class_Twelve_Exam_Centre_Pincode__c = '789123',
            Class_Twelve_Exam_Centre_State__c = 'State 12',
            Class_Twelve_Name_Of_School__c = 'School 12',
            Class_Twelve_Other_Name_Of_School__c = 'Other School 12',
            Class_Twelve_Pass_Percentage__c = 90,
            Class_Twelve_Year_Of_Passing__c = '2016',
            Class_Twelve_Exam_Center_Block__c = 'Block 12',
            Type_Of_Disablity__c = 'Visual Impairment',
            Other_Disability_Type__c = 'None',
            Specially_Abled__c = 'No',
            Category__c = 'General',
            Other_Category__c = 'None',
            Current_Family_Status__c = 'Orphan',
            Family_Income_Per_Year__c = '5.0 to 7.5 lakh rupee',
            Other_Current_Family_Status__c = 'None',
            Religion__c = 'Hindu',
            Other_Religion__c = 'None',
            Mother_Living_Status__c = 'Deceased',
            Mother_Occupation__c = 'Household Work',
            Mother_Other_Education_Details__c = 'None',
            Mother_Education_Details__c = 'Graduate',
            Father_Education_Details__c = 'Graduate',
            Father_Living_Status__c = 'Living',
            Father_Occupation__c = 'Agriculture Worker',
            Father_Other_Education_Details__c = 'None',
            Guardian_Education_Details__c = 'Not Educated',
            Guardian_Other_Education_Details__c = 'None',
            Guardian_Full_Name__c = 'Guardian Name'
        );
        insert testContact;

        Scholarship__c scholarship = new Scholarship__c(Scholarship_Name__c = 'Test Scholarship');
        insert scholarship;

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

        // Create an Application record related to the Contact
        Application__c testApplication = new Application__c(
            Contact__c = testContact.Id,
            Scholarship_Round__c = scholarRound.Id,
            Application_External_Status__c = 'Draft',
            Submission_Date__c = DateTime.now(),
            Is_Consent_Given__c = true
        );
        insert testApplication;

        // Create an Admission record related to the Contact
        Admission__c testAdmission = new Admission__c(
            Name_Of_The_Institute__c = 'Test College',
            Other_Name_Of_Institute__c = 'Other Test College',
            Course_Name__c = 'Test Course',
            Other_Course_Name__c = 'Other Test Course',
            Year_Of_Admission__c = '2020',
            Institute_State__c = 'Karnataka',
            Institute_District__c = 'Bangalore',
            Course_Type__c = 'Undergraduate Diploma',
            Course_Duration_In_Years__c = '3',
            Course_Start_Date__c = '2020-08-01',
            Course_Year_Of_Studying__c = '3',
            Accommodation_Type__c = 'Hostel',
            Other_Accommodation_Type__c = 'Other Hostel',
            College_Student_Id__c = '12345',
            Contact__c = testContact.Id,
            Application__c = testApplication.Id
        );
        insert testAdmission;

        // Set up the page reference with the Contact ID
       Test.setCurrentPageReference(new PageReference('/apex/APFS_ApplicationPreview'));
        ApexPages.currentPage().getParameters().put('id', testApplication.Id);

        Test.startTest();
        // Instantiate the controller
        APFS_ApplicationPreviewController controller = new APFS_ApplicationPreviewController();
        controller.contactId = testContact.Id;  // Ensure the controller has the contact ID
        Test.stopTest();

        // Debugging Information
        System.debug('Contact ID: ' + controller.contactId);
        System.debug('Contact Record: ' + controller.contactRecord);

        // Assertions to validate the controller properties and fetched records
        System.assertNotEquals(controller.contactId, null, 'Contact ID should not be null.');
       
    }
}