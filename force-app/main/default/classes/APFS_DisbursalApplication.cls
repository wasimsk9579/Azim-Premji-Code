public without sharing class APFS_DisbursalApplication {

    @AuraEnabled
    public static List<ApplicationWrapper> fetchApplicationWithVerification(
        Id scholarshipId, 
        String applicationInternalValue, 
        String state, 
        String district, 
        String referralValue, 
        Integer limitSize, 
        Integer offset
    ) {

        List<ApplicationWrapper> wrapperList = new List<ApplicationWrapper>();
        
        try {
            String query = 'SELECT Id, Name, Contact__r.Name, Application_Internal_Status__c, ' +
                           'Scholarship_Round__c, LastModifiedBy.Name, ' +
                           'Contact__r.Referred_By_APF_Or_Partners__c, Contact__r.MobilePhone, ' +
                           'Contact__r.Referral_Partner_Name__c, Contact__r.Class_Twelve_Exam_Centre_District__c, ' +
                           '(SELECT Id, Name, Total_Scholarship_Amount__c ' +
                           ' FROM Offers__r ' +
                           ' WHERE Current_Offer__c = true ' + 
                           ' ORDER BY CreatedDate DESC LIMIT 1) ' + 
                           ' FROM Application__c ' +
                           ' WHERE Id In (select Application__c from Offer__c) and Scholarship_Round__r.Scholarship_Edition__r.Scholarship__c = :scholarshipId ' +
                           ' AND Application_Internal_Status__c = :applicationInternalValue ';

            // Add filters for Contact fields if provided
            if (String.isNotEmpty(state) && !state.equalsIgnoreCase('None')) {
                query += ' AND Contact__r.Class_Twelve_Exam_Centre_State__c = :state';
            }
            
            if (String.isNotEmpty(district) && !district.equalsIgnoreCase('None')) {
                query += ' AND Contact__r.Class_Twelve_Exam_Centre_District__c = :district';
            }
            
            if (String.isNotEmpty(referralValue) && !referralValue.equalsIgnoreCase('All')) {
                query += ' AND Contact__r.Referred_By_APF_Or_Partners__c = :referralValue';
            }
            
            query += ' ORDER BY Name LIMIT :limitSize OFFSET :offset';

            System.debug('Constructed SOQL Query: ' + query);

            List<Application__c> applications = Database.query(query);

            // Query the bank details for each application by joining with the Contact record
            Set<Id> contactIds = new Set<Id>();
            for (Application__c app : applications) {
                contactIds.add(app.Contact__c);
            }

            Map<Id, Bank_Detail__c> bankDetailsMap = new Map<Id, Bank_Detail__c>();
            if (!contactIds.isEmpty()) {
                List<Bank_Detail__c> bankDetails = [
                    SELECT Id, Name, Bank_Ifsc_Code__c, Bank_Account_Type__c, Other_Bank_Account_Type__c, 
                           Encrypted_Bank_Account_Number__c, Branch_Name__c, Contact__c , (SELECT Id, Field FROM Histories WHERE Field != 'created')
                    FROM Bank_Detail__c WHERE Contact__c IN :contactIds
                ];

                for (Bank_Detail__c bankDetail : bankDetails) {
                    bankDetailsMap.put(bankDetail.Contact__c, bankDetail);
                }
            }

            // Wrapping the Application and Bank Details in the ApplicationWrapper
            for (Application__c app : applications) {
                ApplicationWrapper wrapper = new ApplicationWrapper();
                wrapper.application = app;

                // Attach bank details if available
                if (bankDetailsMap.containsKey(app.Contact__c)) {
                    wrapper.bankDetail = new BankDetailWrapper(bankDetailsMap.get(app.Contact__c));
                    wrapper.bankDetail.isModified = bankDetailsMap.get(app.Contact__c).Histories.size() > 0; // Kiruba Sankar M
                }

                // Adding Offers to the wrapper
                for (Offer__c offer : app.Offers__r) {
                    wrapper.offers.add(new OfferWrapper(offer));
                }

                wrapperList.add(wrapper);
            }

        } catch (Exception e) {
            APFS_DebugLogUtility.logError('Class', 'APFS_OfferApplications', 'fetchApplicationWithVerification', e.getMessage(), UserInfo.getUserId());
            throw new APFS_CustomException('Error fetching Application records: ' + e.getMessage());
        }
        
        return wrapperList;
    }

    // Wrapper Class for Application
    public class ApplicationWrapper {
        @AuraEnabled
        public Application__c application { get; set; }

        @AuraEnabled
        public List<OfferWrapper> offers { get; set; }

        @AuraEnabled
        public BankDetailWrapper bankDetail { get; set; }

        // Constructor
        public ApplicationWrapper() {
            offers = new List<OfferWrapper>();
            bankDetail = new BankDetailWrapper();
        }
    }

    // Wrapper Class for Offer
    public class OfferWrapper {
        @AuraEnabled public Id id { get; set; }
        @AuraEnabled public String name { get; set; }

        // Constructor
        public OfferWrapper(Offer__c offer) {
            id = offer.Id;
            name = offer.Name;
        }
    }

    // Wrapper Class for Bank Detail
    public class BankDetailWrapper {
        @AuraEnabled public Id id { get; set; }
        @AuraEnabled public String name { get; set; }
        @AuraEnabled public String ifscCode { get; set; }
        @AuraEnabled public String accountType { get; set; }
        @AuraEnabled public String otherAccountType { get; set; }
        @AuraEnabled public String encryptedAccountNumber { get; set; }
        @AuraEnabled public String branchName { get; set; }
        @AuraEnabled public Boolean isModified  { get; set; } // Kiruba Sankar M / 15-10-2024

        // Constructor
        public BankDetailWrapper(Bank_Detail__c bankDetail) {
            id = bankDetail.Id;
            name = bankDetail.Name;
            ifscCode = bankDetail.Bank_Ifsc_Code__c;
            accountType = bankDetail.Bank_Account_Type__c;
            otherAccountType = bankDetail.Other_Bank_Account_Type__c;
            encryptedAccountNumber = bankDetail.Encrypted_Bank_Account_Number__c;
            branchName = bankDetail.Branch_Name__c;
        }

        // Empty constructor for initial wrapper instantiation
        public BankDetailWrapper() {}
    }
}