/**
 * @description       : Trigger handler class for handling actions post User insert, including sending SMS to users with
 *                      the 'Scholarship Portal Applicant' profile.
 *                      This handler utilizes MSG91 for sending SMS and handles bulk processing to optimize performance.
 * 
 * @author            : owais.ahanger@cloudodyssey.co
 * @last modified on  : 16-10-2024
 * @last modified by  : owais.ahanger@cloudodyssey.co
 */
public without sharing class APFS_SendUserNameTriggerHandler {

    /**
     * @description : Handles the after-insert logic for newly created users, which includes sending SMS notifications
     *                and any future operations.
     * @param newUsers : List of newly created User records.
     */
    public static void handleAfterInsert(List<User> newUsers) {
        if (newUsers.isEmpty()) {
            System.debug('No users to process for insert.');return;
        }
        
        try {
            System.debug('Handling after insert for users: ' + newUsers.size());
            
            // Call to send SMS to users with the Scholarship Portal Applicant profile
            sendUsernameToScholarshipApplicants(newUsers);

        } catch (Exception e) { APFS_DebugLogUtility.logError('Class', 'APFS_SendUserNameTriggerHandler', 'handleAfterInsert', e.getMessage(), UserInfo.getUserId());throw new APFS_CustomException('Error in handleAfterInsert: ' + e.getMessage());
        }
    }

    /**
     * @description : Sends an SMS to users associated with the 'Scholarship Portal Applicant' profile.
     *                Collects the necessary profile and contact data and calls the SMS utility for each valid user.
     * @param newUsers : List of newly created User records.
     */
    private static void sendUsernameToScholarshipApplicants(List<User> newUsers) {
        if (newUsers.isEmpty()) {
            System.debug('No users to process for sending SMS.');return;
        }

        Set<Id> profileIds = new Set<Id>();
        Set<Id> contactIds = new Set<Id>();
        List<User> scholarshipApplicantUsers = new List<User>();

        // Collect ProfileIds and ContactIds from the new users
        for (User newUser : newUsers) {
            profileIds.add(newUser.ProfileId);
            if (newUser.ContactId != null) {
                contactIds.add(newUser.ContactId);
            }
        }

        try {
            // Bulk query profiles and contacts
            Map<Id, Profile> profileMap = new Map<Id, Profile>([SELECT Id, Name FROM Profile WHERE Id IN :profileIds]);
            Map<Id, Contact> contactMap = new Map<Id, Contact>([SELECT Id, MobilePhone FROM Contact WHERE Id IN :contactIds]);

            // Filter users based on profile and prepare for SMS sending
            for (User newUser : newUsers) {
                Profile userProfile = profileMap.get(newUser.ProfileId);
                if (userProfile != null && userProfile.Name == 'Scholarship Portal Applicant') {
                    scholarshipApplicantUsers.add(newUser); 
                }
            }

            // If there are users to send SMS to
            if (!scholarshipApplicantUsers.isEmpty()) {
                for (User newUser : scholarshipApplicantUsers) {
                    // Fetch the associated contact and check for a valid mobile number
                    Contact contact = contactMap.get(newUser.ContactId);
                    if (contact != null && !String.isBlank(contact.MobilePhone)) {
                        // Construct the dynamic variables for the SMS template
                        Map<String, String> vars = new Map<String, String> {
                            'var' => 'Hello',  
                            'var1' => newUser.FirstName, 
                            'var2' => newUser.Username.replace('@applicant.com', '') 
                        };

                        // Use the MSG91 utility to send the SMS
                        try {
                            APFS_Msg91UtilityController.sendSms(contact.MobilePhone, 'Succesful_Registration', vars);
                            System.debug('SMS sent to user: ' + newUser.Id + ', mobile: ' + contact.MobilePhone);
                        } catch (Exception e) {
                            // Log any SMS sending error
                            APFS_DebugLogUtility.logError('Class', 'APFS_SendUserNameTriggerHandler', 'sendUsernameToScholarshipApplicants', e.getMessage(), UserInfo.getUserId());
                        }
                    } else {
                        System.debug('No valid mobile number for user: ' + newUser.Id);
                    }
                }
            } else {
                System.debug('No users found with the Scholarship Portal Applicant profile.');
            }

        } catch (Exception e) {APFS_DebugLogUtility.logError('Class', 'APFS_SendUserNameTriggerHandler', 'sendUsernameToScholarshipApplicants', e.getMessage(), UserInfo.getUserId());throw new APFS_CustomException('Error processing scholarship applicant users: ' + e.getMessage());
        }
    }
}