/**
 * @description       : Getting Bank Name and Branch Name by IFSC code by using Rest Api for apfs experience site.
 * @author            : wasimuddin.sheikh@cloudodyssey.co
 * @last modified on  : 18-07-2024
 * @last modified by  : wasimuddin.sheikh@cloudodyssey.co
 * Test Class		  : 
**/
public without sharing class APFS_BankDetailsController {
    @AuraEnabled
    public static List<Bank__c> getBankDetailsByIfscCode(string ifscCode) {
        return [
           SELECT Id, Bank_Name__c, IFSC_Code__c, Branch_Name__c FROM Bank__c 
            WHERE IFSC_Code__c = :ifscCode];
    }



    @AuraEnabled(cacheable=true)
    public static List<Bank_Detail__c> getBankDetailsByContactId(string contactId) {
        return [
            SELECT Id, Encrypted_Bank_Account_Number__c, Bank_Ifsc_Code__c, Name, Branch_Name__c ,Bank_Details_Consent__c
            FROM Bank_Detail__c 
            WHERE Contact__c = :contactId
        ];
    }
}