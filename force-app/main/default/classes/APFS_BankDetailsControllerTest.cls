@isTest
private class APFS_BankDetailsControllerTest {


    @isTest
    static void testGetBankDetailsByContactId() {
        // Setup test data
        Contact testContact = new Contact(FirstName = 'Test', LastName = 'Contact', Email = 'testcontact@example.com');
        insert testContact;

        Bank_Detail__c bankDetail = new Bank_Detail__c(
            Contact__c = testContact.Id,
            Encrypted_Bank_Account_Number__c = '1234567890',
            Bank_Ifsc_Code__c = 'SAMPLEIFSC',
            Name = 'Sample Bank',
            Branch_Name__c = 'Sample Branch',
            Bank_Details_Consent__c = true
        );
        insert bankDetail;

        Test.startTest();
        List<Bank_Detail__c> results = APFS_BankDetailsController.getBankDetailsByContactId(testContact.Id);
        Test.stopTest();
        
        // Assert the results
        System.assertNotEquals(null, results, 'Results should not be null.');
        System.assertEquals(1, results.size(), 'There should be one bank detail.');
        System.assertEquals('Sample Bank', results[0].Name, 'Bank name should match.');
        System.assertEquals('Sample Branch', results[0].Branch_Name__c, 'Branch name should match.');
    }
    
    
    @isTest
    static void testGetBankDetailsByIfscCode() {
        // Setup test data for Bank__c
        Bank__c testBank = new Bank__c(
            Bank_Name__c = 'Test Bank',
            IFSC_Code__c = 'TEST0001234',
            Branch_Name__c = 'Test Branch'
        );
        insert testBank;

        Test.startTest();
        // Call the method to get bank details by IFSC code
        List<Bank__c> bankDetails = APFS_BankDetailsController.getBankDetailsByIfscCode('TEST0001234');
        Test.stopTest();

        // Assert that results are correct
        System.assertNotEquals(null, bankDetails, 'Bank details should not be null.');
        System.assertEquals(1, bankDetails.size(), 'There should be one bank detail.');
        System.assertEquals('Test Bank', bankDetails[0].Bank_Name__c, 'Bank name should match.');
        System.assertEquals('Test Branch', bankDetails[0].Branch_Name__c, 'Branch name should match.');
    }

    
    }