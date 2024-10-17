@isTest
public class APFS_ApplicantMobileOtpHandlerTest {

    @testSetup
    static void setupTestData() {
        // You can put common test setup data here if needed
    }

    @isTest
    static void testSendOtp() {
        String testPhoneNumber = '1234567890';

        // Set up mock response
        Test.startTest();
        Test.setMock(HttpCalloutMock.class, new MockHttpResponseGenerator());
        APFS_ApplicantMobileOtpHandler.sendOtp(testPhoneNumber);
        Test.stopTest();

        List<Applicant_Mobile_Number_Verifier__c> otpRecords = [SELECT Phone__c, OTP__c FROM Applicant_Mobile_Number_Verifier__c WHERE Phone__c = :testPhoneNumber LIMIT 1];
        System.assertNotEquals(0, otpRecords.size(), 'OTP record should be created or updated');
        System.assertEquals(testPhoneNumber, otpRecords[0].Phone__c, 'Phone number should match');
        System.assertNotEquals(null, otpRecords[0].OTP__c, 'OTP should be generated');
    }

    @isTest
    static void testVerifyOtp_CorrectOtp() {
        String testPhoneNumber = '1234567890';
        String testOtp = '123456';

        Applicant_Mobile_Number_Verifier__c otpRecord = new Applicant_Mobile_Number_Verifier__c(
            Phone__c = testPhoneNumber,
            OTP__c = testOtp
        );
        insert otpRecord;

        Test.startTest();
        Boolean isVerified = APFS_ApplicantMobileOtpHandler.verifyOtp(testPhoneNumber, testOtp);
        Test.stopTest();

        System.assertEquals(true, isVerified, 'OTP should be verified successfully');
    }

    @isTest
    static void testVerifyOtp_IncorrectOtp() {
        String testPhoneNumber = '1234567890';
        String testOtp = '123456';
        String incorrectOtp = '654321';

        Applicant_Mobile_Number_Verifier__c otpRecord = new Applicant_Mobile_Number_Verifier__c(
            Phone__c = testPhoneNumber,
            OTP__c = testOtp
        );
        insert otpRecord;

        Test.startTest();
        Boolean isVerified = APFS_ApplicantMobileOtpHandler.verifyOtp(testPhoneNumber, incorrectOtp);
        Test.stopTest();

        System.assertEquals(false, isVerified, 'OTP verification should fail');
    }

    @isTest
    static void testVerifyOtpNoRecord() {
        String testPhoneNumber = '0987654321';

        Test.startTest();
        Boolean isVerified = APFS_ApplicantMobileOtpHandler.verifyOtp(testPhoneNumber, '123456');
        Test.stopTest();

        System.assertEquals(false, isVerified, 'OTP verification should fail when no OTP record exists');
    }

    @isTest
    static void testSendOtp_ExceptionHandling() {
        // Set up mock response
        Test.startTest();
        Test.setMock(HttpCalloutMock.class, new MockHttpResponseGenerator());

        String invalidPhoneNumber = null;
        
        try {
            APFS_ApplicantMobileOtpHandler.sendOtp(invalidPhoneNumber);
            System.assert(false, 'Expected APFS_CustomException was not thrown');
        } catch (APFS_CustomException e) {
            System.assert(true, 'APFS_CustomException was thrown as expected');
        }
        
        Test.stopTest();
    }
}