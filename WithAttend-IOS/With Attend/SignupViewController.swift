//
//  SignupViewController.swift
//  WithAttend
//
//  Created by Brandon Mayhew on 2016-03-28.
//  Copyright © 2016 MayU Studios. All rights reserved.
//

import UIKit
import SwiftDDP

class SignupViewController: UIViewController {
    var indicator = UIActivityIndicatorView()

    override func viewDidLoad() {
        super.viewDidLoad()

        // Do any additional setup after loading the view.
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    
    //Func
    func signup(){
        indicator.startAnimating()
        indicator.backgroundColor = UIColor.white
        var username = UserDefaults.standard.string(forKey: "username")
        var password = UserDefaults.standard.string(forKey: "password")
        if(Meteor.client.loggedIn()){
            print("already logged in.")
            self.performSegue(withIdentifier: "seguetoscan", sender: nil)
        }
        print("called begin button")
        print("Username:"+username!+" Password:"+password!)
        Meteor.loginWithUsername(username: username!,password: password!) { result, error in
            self.indicator.stopAnimating()
            self.indicator.hidesWhenStopped = true
            print("result")
            print(result)
            print("error")
            print(error)
            if error == nil {
                //the log-in was successful and the user is now the active user and credentials saved
                //hide log-in view and show main app content
                print("Log in Success")
                self.performSegue(withIdentifier: "seguetoscan", sender: nil)
            } else {
                //there was an error with the update save
                print("login error")
                let message = error?.error
                let alert = UIAlertView(
                    title: NSLocalizedString("Login Failed", comment: ""),
                    message: message,
                    delegate: nil,
                    cancelButtonTitle: NSLocalizedString("OK", comment: "OK")
                )
                alert.show()
            }
        }
        
        func activityIndicator() {
            indicator = UIActivityIndicatorView(frame: CGRect(x: 0, y: 0, width: 40, height: 40))
            indicator.activityIndicatorViewStyle = UIActivityIndicatorViewStyle.gray
            indicator.center = self.view.center
            self.view.addSubview(indicator)
        }

    }
    
    //Buttons
    @IBAction func signup(_ sender: AnyObject) {
        signup()
    }
}
