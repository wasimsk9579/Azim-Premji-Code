public with sharing class ApfsCoChangePasswordcontroller {
    @AuraEnabled
    public static String changePassword(String newPassword, String verifyNewPassword, String oldPassword) {
    
        try {
            // Change the password using the Site.changePassword method
            Site.changePassword(newPassword, verifyNewPassword, oldPassword);
            return 'Success';
        } catch (Exception ex) { String errorMessage; if (ex.getMessage().contains('Your old password is invalid.')) { errorMessage = 'Your old password is incorrect.';  } else if (ex.getMessage().contains('Error: You cannot reuse this old password.')) {errorMessage = 'You cannot reuse this password as new password.';} else {errorMessage = 'An error occurred while changing the password: ' + ex.getMessage();}AuraHandledException error = new AuraHandledException(errorMessage); error.setMessage(errorMessage); throw error;
        }
    }
}