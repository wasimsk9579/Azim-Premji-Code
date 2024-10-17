/**
 * @description       : Custom self registration controller for apfs experience site.
 * @author            : owais.ahanger@cloudodyssey.co
 * @last modified on  : 17-07-2024
 * @last modified by  : owais.ahanger@cloudodyssey.co
 * Test Class		  : APFS_UserRegistrationControllerTest
**/
public without sharing class APFS_UserRegistrationController {
    
	//Constants for profile and account owner name
    private static final string PROFILE_NAME='Scholarship Portal Applicant';
    private static final string ACCOUNT_NAME='Azim Premji Foundation Scholarship Portal Site';
	private static final string CONTACT_OWNER=[SELECT Username__c FROM SCHOLARSHIP_PORTAL_DEFAULT_CONTACT_OWNER__mdt LIMIT 1].Username__c;
    
	 /*
    * Method to register a user with the given details. If successful, returns the new User's Id.
    * @param firstName: The first name of the user.
    * @param lastName: The last name of the user.
    * @param mobileNumber: The mobile number of the user.
    * @param aadhaarNumber: The Aadhaar number of the user.
    * @return Id: The Id of the newly created User.
    */
    @AuraEnabled
    public static Id registerUser(String firstName, String lastName, String mobileNumber, String aadhaarOrClassTenRollNumber,Boolean isAadhaarAvailable) {
        Savepoint sp = Database.setSavepoint();
        try {
            if (isAadhaarAvailable) {
                	    //Check if the Aadhaar number already exists
               		Integer duplicateAadhaar = [SELECT COUNT() FROM Contact WHERE Aadhaar_Number__c = :aadhaarOrClassTenRollNumber];
           		 if (duplicateAadhaar > 0) {
                throw new APFS_CustomException('Aadhaar number already registered.');
            	}
            }
            else{
                // Check if the class ten roll number already exists
                Integer duplicateClassTenRollNumber = [SELECT COUNT() FROM Contact WHERE Class_Ten_Rollno__c = :aadhaarOrClassTenRollNumber];
                if (duplicateClassTenRollNumber > 0) {
                    throw new APFS_CustomException('Class 10th roll number already registered.');
                }
            }
        
           

            // Generate username
           
            String firstNamePart = generateFirstNamePart(firstName);
            String aadhaarOrClassTenRollNumberPart = aadhaarOrClassTenRollNumber.length() > 4 ? aadhaarOrClassTenRollNumber.substring(aadhaarOrClassTenRollNumber.length() - 4) : aadhaarOrClassTenRollNumber;
            String uniqueUsername = (firstNamePart + aadhaarOrClassTenRollNumberPart).toLowerCase() + '@applicant.com';
			String communityName = (firstNamePart + aadhaarOrClassTenRollNumberPart).toLowerCase();
            // Check if the username already exists
            Integer existingUsers = [SELECT COUNT() FROM User WHERE Username = :uniqueUsername];
            if (existingUsers > 0) { throw new APFS_CustomException('Username already exists. Please try a different username.');
            }

            

            // Create the Contact
            Contact newContact = createContact(firstName, lastName,uniqueUsername, mobileNumber,isAadhaarAvailable, aadhaarOrClassTenRollNumber);

            // Create the User
            User newUser = createUser(firstName, lastName,uniqueUsername,communityName, newContact.Id);
            
			system.debug('Community user created successfully!');
            return newUser.Id;
        }  catch (Exception e) {
            Database.rollback(sp);
            throw new APFS_CustomException(e.getMessage());
        }
    }

	/*
    * Method to set the password for a given user.
    * @param userId: The Id of the user.
    * @param password: The new password to set.
    */

    @AuraEnabled
    public static void setPassword(Id userId, String password) {
        try{
            System.setPassword(userId, password);
            system.debug('Community user password set successfully!');
        }catch(Exception e){ throw new APFS_CustomException(e.getMessage());
        }
        
    }


	 /*
    * Private method to create a Contact record.
    * @param firstName: The first name of the contact.
    * @param lastName: The last name of the contact.
    * @param mobileNumber: The mobile number of the contact.
    * @param aadhaarNumber: The Aadhaar number of the contact.
    * @return Contact: The newly created Contact record.
    */
    private static Contact createContact(String firstName, String lastName,String uniqueUsername, String mobileNumber,Boolean isAadhaarAvailable, String aadhaarOrClassTenRollNumber) {
        try {
            Id predefinedAccountId = [SELECT Id FROM Account WHERE Name =:ACCOUNT_NAME LIMIT 1].Id;
			Id preDefinedContactOwner=[SELECT Id FROM User WHERE Username=:CONTACT_OWNER LIMIT 1].Id;

            Contact newContact = new Contact(
                FirstName = firstName,
                LastName = lastName,
                AccountId = predefinedAccountId,
                MobilePhone = mobileNumber,
                Aadhaar_Number__c = isAadhaarAvailable?aadhaarOrClassTenRollNumber:'',
				Class_Ten_Rollno__c=isAadhaarAvailable?'':aadhaarOrClassTenRollNumber,
                Is_Aadhaar_Available__c=isAadhaarAvailable?'Yes':'No',
                GenderIdentity='Female',
                OwnerId=preDefinedContactOwner
            );
            insert newContact;
            return newContact;
        } catch (DmlException e) { throw new APFS_CustomException('Error creating contact: ' + e.getMessage());
        }
    }

    
    /*
    * Private method to create a User record.
    * @param firstName: The first name of the user.
    * @param lastName: The last name of the user.
    * @param mobileNumber: The mobile number of the user.
    * @param uniqueUsername: The unique username for the user.
    * @param communityName: The community nick name of user.
    * @param contactId: The Id of the associated Contact record.
    * @return User: The newly created User record.
    */
    private static User createUser(String firstName, String lastName,String uniqueUsername,String communityName, Id contactId) {
        try {
        		
            	User newUser = new User(
                FirstName = firstName,
                LastName = lastName,
                Username = uniqueUsername,
                CommunityNickname = communityName,
                Email = uniqueUsername,
                ContactId = contactId,
                ProfileId = [SELECT Id FROM Profile WHERE Name =:PROFILE_NAME LIMIT 1].Id,
                Alias = firstName.substring(0, 1).toLowerCase() + (lastName.length() > 4 ? lastName.substring(0, 4).toLowerCase() : lastName.toLowerCase()),
                TimeZoneSidKey = 'Asia/Kolkata',
                LocaleSidKey = 'en_IN',
                EmailEncodingKey = 'UTF-8',
                LanguageLocaleKey = 'en_US',
                IsActive = true
            );
            insert newUser;
            return newUser;
        } catch (DmlException e) { throw new APFS_CustomException('Error creating user: ' + e.getMessage());
        }
    }


/*
    * Method to generate the firstNamePart according to the specified rules.
    * @param firstName: The first name of the user.
    * @return String: The processed first name part.
    */
    private static String generateFirstNamePart(String firstName) {
        firstName = firstName.trim();

        if (firstName.length() == 3) {
            // If the first name is exactly 3 characters, append '1'
            firstName += '1';
        } else if (firstName.contains(' ')) {
            // If the first name contains spaces, remove the spaces and ensure it has a maximum of 4 characters
            firstName = firstName.replaceAll('\\s+', '');
            if (firstName.length() > 4) {
                firstName = firstName.substring(0, 4);
            }
        } else if (firstName.length() > 4) {
            // If the first name is longer than 4 characters, truncate it to 4 characters
            firstName = firstName.substring(0, 4);
        }

        return firstName.toLowerCase();
    }
}