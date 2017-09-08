//
//  historyViewController.swift
//  WithAttend
//
//  Created by Joshua on 2016-03-28.
//  Copyright © GreenDotDev. All rights reserved.
//

import UIKit

class historyViewController: UIViewController {
    @IBOutlet weak var webView: UIWebView!
    @IBOutlet weak var menuButton: UIBarButtonItem!
       override func viewDidLoad() {
        super.viewDidLoad()
        let url = URL (string: "http://www.withattend.com");
        let requestObj = URLRequest(url: url!);
        webView.loadRequest(requestObj);
    }
    
    override func viewDidAppear(_ animated: Bool) {
        NSLog("View appeared")
        if self.revealViewController() != nil {
            NSLog("Loading sidebar from history controller")
            menuButton.target = self.revealViewController()
            menuButton.action = #selector(SWRevealViewController.revealToggle(_:))
            self.view.addGestureRecognizer(self.revealViewController().panGestureRecognizer())
        }
    }
    
    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [AnyHashable: Any]?) -> Bool {
        navigationController?.navigationBar.isHidden = false
        return true
    }
    
    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    
}