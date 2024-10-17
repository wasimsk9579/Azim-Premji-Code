/**
 * @description       : Controller to handle custom reset/forgot password  for apfs site.
 * @author            : owais.ahanger@cloudodyssey.co
 * @last modified on  : 17-07-2024
 * @last modified by  : owais.ahanger@cloudodyssey.co
 * Test Class		  : APFS_ForgotPasswordControllerTest
**/
public without sharing class APFS_ForgotPasswordController {

    // Wrapper class to hold user details
    public class UserDetails {
        @AuraEnabled
        public String userId { get; set; }
        @AuraEnabled
        public String mobilePhone { get; set; }

        public UserDetails(String userId, String mobilePhone) {
            this.userId = userId;
            this.mobilePhone = mobilePhone;
        }
    }

 /**
     * @description       : Resets the password for the user with the given username by sending an OTP to their registered mobile number.
     * @param username    : The username of the user requesting a password reset.
     * @return UserDetails: An instance of UserDetails containing the userId and phone number of the user.
     * @throws APFS_CustomException : Exception thrown if the user does not exist or if there is an error in sending the OTP.
     */
    @AuraEnabled
    public static UserDetails resetPassword(String username) {
        try {
            // Find the user by username
            List<User> uniqueUser = [SELECT Id,ContactId FROM User WHERE Username = :username LIMIT 1];
            if (uniqueUser.isEmpty()) {
                throw new APFS_CustomException('User does not exist.');
            }
            // Get the contact Id,FirstName and MobilePhone from the user ID
        	List<Contact> uniqueContact = [SELECT Id,FirstName,MobilePhone FROM Contact WHERE Id = :uniqueUser[0].ContactId LIMIT 1];
           
            //Send OTP to registered mobile number. TO DO ADD AS PER TEMPLATE
            APFS_ApplicantMobileOtpHandler.sendOtp(uniqueContact[0].MobilePhone);
             // Return user ID and phone number
            return new UserDetails(uniqueUser[0].Id, uniqueContact[0].MobilePhone);
        } catch (Exception e) {
            throw new APFS_CustomException('Failed to reset password: ' + e.getMessage());
        }
    }


 /**
     * @description       : Changes the password for the user with the given userId.
     * @param userId      : The Id of the user whose password is to be changed.
     * @param password    : The new password to be set for the user.
     * @throws APFS_CustomException : Exception thrown if there is an error in changing the password.
     */
    @AuraEnabled
    public static void changePassword(Id userId,String password) {
        try{
          
            System.setPassword(userId, password);
            system.debug('Community user password changed successfully!');
        }catch(Exception e){
            if (e.getMessage().contains('invalid repeated password')) {
                throw new APFS_CustomException('You cannot use your old password.Please select a different password.');
            } else {
                throw new APFS_CustomException('An unexpected error occurred: ' + e.getMessage());
            }
            	
        }
        
    }




}