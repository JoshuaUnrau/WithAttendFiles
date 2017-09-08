//
//  loginViewController.swift
//  WithAttend
//
//  Created by Brandon Mayhew on 2016-03-28.
//  Copyright © 2016 MayU Studios. All rights reserved.
//

import UIKit
import SwiftDDP
import Foundation
import CoreBluetooth

class setUpViewController: UIViewController, CBPeripheralManagerDelegate, CLLocationManagerDelegate {
    var bluetoothPeripheralManager: CBPeripheralManager?
    let locationManager = CLLocationManager()
    override func viewWillAppear(_ animated: Bool){
        super.viewDidLoad()
        self.navigationController?.isNavigationBarHidden = true
        let statusBar: UIView = UIApplication.shared.value(forKey: "statusBar") as! UIView
        if(statusBar.responds(to: #selector(setter: UIView.backgroundColor))) {
            statusBar.backgroundColor = UIColor.clear
        }
        self.view.backgroundColor = UIColor(patternImage: UIImage(named: "constructionsite.png")!)
        // Do any additional setup after loading the view.
        let pin: Int = UserDefaults.standard.integer(forKey: "userpin")
        if(pin != 0){
            NSLog("pin code is: "+String(pin))
            pinTextField.text = String(pin)
            //verify(pin)
        }
        locationManager.delegate = self
        if (CLLocationManager.authorizationStatus() != CLAuthorizationStatus.authorizedWhenInUse)
        {
            locationManager.requestWhenInUseAuthorization()
        }
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    
    //Functions

    func verify(_ pin:Int){
        if(Reachability.isConnectedToNetwork()){
            // continue
        }
        else{
            let message = ""
            let alert = UIAlertView(
                title: NSLocalizedString("You need to connect to the internet to continue.", comment: ""),
                message: message,
                delegate: nil,
                cancelButtonTitle: NSLocalizedString("OK", comment: "OK")
            )
            alert.show()
            NSLog("No internet connection!")
            return
        }
        let json: [String: AnyObject] = [
            "code": String(pin) as AnyObject
        ]
        NSLog("Calling pin verify function with pid code: "+String(pin))
        Meteor.call(name: "pinCodes.validate", params: [json as AnyObject]) { result, error in
            print("got result")
            if(error != nil)
            {
                //save failed
                NSLog("call failed")
                print("error: "+String(describing: error))
                var errormessage = (error?.error)!
                if(error?.reason != nil){
                    errormessage = (error?.reason)!
                }
                let alert = UIAlertView(title:
                    NSLocalizedString(errormessage, comment: ""),
                        message: "Make sure you entered the correct pin",
                        delegate: nil,
                        cancelButtonTitle: NSLocalizedString("OK", comment: "OK")
                )
                alert.show()
                
            }
            else
            {
                //progressView?.progress = 1
                //alertView.dismiss(animated: true, completion: nil)
                NSLog("call worked")
                print("result is")
                print(result!)
                let username: String = result!["username"] as! String //failed at this line
                let password: String = result!["secret"] as! String
                let userid: String = result!["userId"] as! String
                let companyid: String = result!["companyId"] as! String
                resetKeys(userid: userid)
                UserDefaults.standard.setValue(username, forKey: "username");
                UserDefaults.standard.setValue(password, forKey: "password");
                UserDefaults.standard.setValue(userid, forKey: "userId");
                UserDefaults.standard.setValue(companyid, forKey: "companyId");
                UserDefaults.standard.set(true, forKey: "accountCreated");
                self.goToFinishSetup()
            }
        }
    }
    
    func goToFinishSetup(){
        print("Going to finish setup")
        self.performSegue(withIdentifier: "finishsetup", sender: nil)
    }
    
    func textField(_ textField: UITextField, shouldChangeCharactersInRange range: NSRange, replacementString string: String) -> Bool
    {
        let numberOnly = CharacterSet.init(charactersIn: "0123456789")
        
        let stringFromTextField = CharacterSet.init(charactersIn: string)
        
        let strValid = numberOnly.isSuperset(of: stringFromTextField)
        
        return strValid
    }
    
    func peripheralManagerDidUpdateState(_ peripheral: CBPeripheralManager) {
        
        var statusMessage = ""
        
        switch peripheral.state.rawValue {
        case 5:
            statusMessage = "Bluetooth Status: Turned On"
            if(UserDefaults.standard.bool(forKey: BLUETOOTH_IS_ACTIVE) == false){
                showThankYouBluetoothAlert()
            }
            UserDefaults.standard.set(true, forKey: BLUETOOTH_IS_ACTIVE);
        case 4:
            statusMessage = "Bluetooth Status: Turned Off"
            UserDefaults.standard.set(false, forKey: BLUETOOTH_IS_ACTIVE);
            showBluetoothAlert()
        case 3:
            statusMessage = "Bluetooth Status: Not Authorized"
            UserDefaults.standard.set(false, forKey: BLUETOOTH_IS_ACTIVE);
            showBluetoothAlert()
        default:
            statusMessage = "Bluetooth Status: Unknown"
        }
        
        NSLog(statusMessage)
        
        /*if peripheral.state == CBPeripheralManagerState.poweredOff {
            //TODO: Update this property in an App Manager class
        }*/
    }
    
    override func touchesBegan(_ touches: Set<UITouch>, with event: UIEvent?) {
        pinTextField.resignFirstResponder() //Resign keyboard that appears
    }

    
    @IBAction func termsConditions(_ sender: AnyObject) {
        if let url = URL(string: "http://withattend.com/legal/"){
            UIApplication.shared.openURL(url)
        }
    }
    
    @IBAction func setUpButtonAction(_ sender: AnyObject) {
        if(!(pinTextField.text?.isEmpty)!){
            verify(Int(pinTextField.text!)!)
        }
        else{
            let message = ""
            let alert = UIAlertView(
                title: NSLocalizedString("No pin was entered", comment: ""),
                message: message,
                delegate: nil,
                cancelButtonTitle: NSLocalizedString("OK", comment: "OK")
            )
            alert.show()
            NSLog("Pin code text field was empty!")
        }
    }
    @IBOutlet weak var pinTextField: UITextField!
}
