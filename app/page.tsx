'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, ChevronLeft } from 'lucide-react'
import { storage, db } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid'; // You'll need to install this package

export default function LogoMagicPro() {
  const [logo, setLogo] = useState<File | null>(null)
  const [targetImage, setTargetImage] = useState<File | null>(null)
  const [logoPlacement, setLogoPlacement] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(0)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isPurchaseDialogOpen, setIsPurchaseDialogOpen] = useState(false)
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [isUserInfoDialogOpen, setIsUserInfoDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPaymentReportDialogOpen, setIsPaymentReportDialogOpen] = useState(false);
  const [isReceiptDialogOpen, setIsReceiptDialogOpen] = useState(false);
  const [receiptNumber, setReceiptNumber] = useState('');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [targetImageUrl, setTargetImageUrl] = useState<string | null>(null);
  const [isSubmitEnabled, setIsSubmitEnabled] = useState(false);
  const [isValidEmail, setIsValidEmail] = useState(false);
  const [paypalTransactionId, setPaypalTransactionId] = useState('');
  const [paypalReceipt, setPaypalReceipt] = useState<File | null>(null);
  const [isPaymentDetailsDialogOpen, setIsPaymentDetailsDialogOpen] = useState(false);

  const observerTarget = useRef(null)

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLogo(e.target.files[0])
      nextStep();
    }
  }

  const handleTargetImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setTargetImage(e.target.files[0])
      nextStep();
    }
  }

  const uploadImageToFirebase = async (file: File, path: string) => {
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!logo) {
      setErrorMessage("Please upload your logo.");
      return;
    }
    if (!targetImage) {
      setErrorMessage("Please upload your target image.");
      return;
    }
    setIsDialogOpen(true);
  }

  const handleDialogConfirm = () => {
    setIsDialogOpen(false);
    setIsUserInfoDialogOpen(true);
  }

  const validateEmail = (email: string) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(String(email).toLowerCase());
  };

  useEffect(() => {
    setIsValidEmail(validateEmail(userEmail));
    setIsSubmitEnabled(validateEmail(userEmail) && userName.trim() !== '');
  }, [userEmail, userName]);

  const handleUserInfoDialogConfirm = async () => {
    if (!isSubmitEnabled || logoPlacement.trim() === '') {
      alert("Please fill in a valid email address, name, and logo placement description.");
      return;
    }

    setIsUserInfoDialogOpen(false);
    setLoading(true);

    try {
      // Upload images to Firebase Storage
      const uploadedLogoUrl = await uploadImageToFirebase(logo!, `logos/${logo!.name}`);
      const uploadedTargetImageUrl = await uploadImageToFirebase(targetImage!, `target-images/${targetImage!.name}`);
      
      setLogoUrl(uploadedLogoUrl);
      setTargetImageUrl(uploadedTargetImageUrl);

      // Save user information and image URLs to Firestore
      await saveUserInfo(userEmail, userName, logoPlacement, uploadedLogoUrl, uploadedTargetImageUrl);
      
      console.log('Logo URL:', uploadedLogoUrl);
      console.log('Target Image URL:', uploadedTargetImageUrl);
      
      setLoading(false);
      setIsPurchaseDialogOpen(true);
    } catch (error) {
      console.error('Error uploading images:', error);
      setErrorMessage("Error uploading images. Please try again.");
      setLoading(false);
    }
  }

  const saveUserInfo = async (email: string, name: string, logoPlacement: string, logoUrl: string, targetImageUrl: string) => {
    try {
      const docRef = await addDoc(collection(db, "users"), {
        email: email,
        name: name,
        logoPlacement: logoPlacement,
        logoUrl: logoUrl,
        targetImageUrl: targetImageUrl,
        createdAt: new Date()
      });
      console.log("User information saved with ID: ", docRef.id);
    } catch (error) {
      console.error("Error saving user information: ", error);
      setErrorMessage("Error saving user information. Please try again.");
    }
  }

  const loadMoreImages = useCallback(() => {
    setLoading(true)
    setTimeout(() => {
      const newImages = Array(10).fill(null).map((_, i) => 
        `/placeholder.svg?height=300&width=300&text=Image ${images.length + i + 1}`
      )
      setImages(prevImages => [...prevImages, ...newImages])
      setLoading(false)
    }, 1000)
  }, [images])

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && !loading) {
          loadMoreImages();
        }
      },
      { threshold: 1 }
    );

    const currentObserverTarget = observerTarget.current;

    if (currentObserverTarget) {
      observer.observe(currentObserverTarget);
    }

    return () => {
      if (currentObserverTarget) {
        observer.unobserve(currentObserverTarget);
      }
    };
  }, [loading, loadMoreImages]);

  const nextStep = () => {
    setStep((prevStep) => Math.min(prevStep + 1, 2))
  }

  const prevStep = () => {
    setStep((prevStep) => Math.max(prevStep - 1, 0))
  }

  const handleClickOutside = (event: MouseEvent) => {
    const dialog1 = document.getElementById('initial-dialog');
    const dialog2 = document.getElementById('purchase-dialog');
    
    if (
      (dialog1 && !dialog1.contains(event.target as Node)) &&
      (dialog2 && !dialog2.contains(event.target as Node))
    ) {
      setIsDialogOpen(false);
      setIsPurchaseDialogOpen(false);
    }
  }

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [loadMoreImages]);

  const handlePaymentReport = () => {
    // Generate a unique receipt number
    const newReceiptNumber = uuidv4().slice(0, 8).toUpperCase();
    setReceiptNumber(newReceiptNumber);

    // Close the payment report dialog and open the receipt dialog
    setIsPaymentReportDialogOpen(false);
    setIsReceiptDialogOpen(true);

    // Here you would typically save the payment information to your database
    // For now, we'll just log it to the console
    console.log(`Payment reported for user ${userName} (${userEmail}). Receipt number: ${newReceiptNumber}`);
  };

  const handlePaymentDetailsSubmit = async () => {
    if (!paypalTransactionId || !paypalReceipt) {
      alert("Please provide both the PayPal transaction ID and the receipt.");
      return;
    }

    setLoading(true);

    try {
      // Upload PayPal receipt to Firebase Storage
      const receiptUrl = await uploadImageToFirebase(paypalReceipt, `paypal-receipts/${paypalReceipt.name}`);

      // Save payment details to Firestore
      await savePaymentDetails(paypalTransactionId, receiptUrl);

      setLoading(false);
      setIsPaymentDetailsDialogOpen(false);
      handlePaymentReport();
    } catch (error) {
      console.error('Error processing payment details:', error);
      setErrorMessage("Error processing payment details. Please try again.");
      setLoading(false);
    }
  };

  const savePaymentDetails = async (transactionId: string, receiptUrl: string) => {
    try {
      const docRef = await addDoc(collection(db, "payments"), {
        userId: userEmail, // Assuming userEmail is unique identifier
        transactionId: transactionId,
        receiptUrl: receiptUrl,
        createdAt: new Date()
      });
      console.log("Payment details saved with ID: ", docRef.id);
    } catch (error) {
      console.error("Error saving payment details: ", error);
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200">
      <div className="p-4">
        {/* Add the text logo */}
        <div className="absolute top-4 left-4 text-2xl font-bold text-primary">
          lll. LOGOMAGIC PRO
        </div>

        <div className="max-w-6xl mx-auto mb-8 flex flex-col items-center justify-center">
          <div className="w-64 h-24 bg-primary rounded-lg flex items-center justify-center overflow-hidden">
            <Image
              src="/3dgifmaker93156.gif"
              alt="LogoMagic Pro"
              width={256}
              height={96}
              className="w-full h-full object-cover"
              priority
            />
          </div>
        </div>
      
        <div className="max-w-6xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Add Your Logo to Your Product Images</CardTitle>
              <CardDescription>Follow the steps to add your logo to an image.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className={`p-4 rounded ${step === 0 ? 'bg-blue-100' : step === 1 ? 'bg-green-100' : 'bg-yellow-100'}`}>
                  {step === 0 && (
                    <div className="grid w-full items-center gap-1.5">
                      <Label htmlFor="logo">Upload Your Logo</Label>
                      <Input id="logo" type="file" accept="image/*,video/*,.gif" onChange={handleLogoUpload} />
                    </div>
                  )}
                </div>
                <div className={`p-4 rounded ${step === 1 ? 'bg-blue-100' : step === 2 ? 'bg-green-100' : 'bg-yellow-100'}`}>
                  {step === 1 && (
                    <div className="grid w-full items-center gap-1.5">
                      <Label htmlFor="target-image">Upload Target Image</Label>
                      <Input id="target-image" type="file" onChange={handleTargetImageUpload} />
                    </div>
                  )}
                </div>
                <div className={`p-4 rounded ${step === 2 ? 'bg-blue-100' : step === 0 ? 'bg-green-100' : 'bg-yellow-100'}`}>
                  {step === 2 && (
                    <>
                      <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="logo-placement">Logo Placement Description</Label>
                        <Textarea 
                          id="logo-placement" 
                          placeholder="Describe in detail how you want to add your logo (e.g., top-left corner, 20% opacity, 100px width)"
                          value={logoPlacement}
                          onChange={(e) => setLogoPlacement(e.target.value)}
                        />
                      </div>
                      <Button type="submit" disabled={!logo || !targetImage || !logoPlacement}>
                        <Upload className="mr-2 h-4 w-4" /> Add Logo
                      </Button>
                    </>
                  )}
                </div>
                {errorMessage && (
                    <div className="text-red-500 text-sm">
                        {errorMessage}
                    </div>
                )}
              </form>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button onClick={prevStep} disabled={step === 0} variant="outline">
                <ChevronLeft className="mr-2 h-4 w-4" /> Previous
              </Button>
              <div className="w-16"></div>
            </CardFooter>
          </Card>
        </div>

        <div className="mt-8 max-w-6xl mx-auto space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Before and After Comparison</CardTitle>
              <CardDescription>See the difference your logo makes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: 'red' }}>Before</h3>
                  <div className="aspect-w-16 aspect-h-9">
                    <Image src="/before-1.jpg" alt="Before 1" width={640} height={360} className="w-full h-auto object-contain rounded-lg" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: 'green' }}>After</h3>
                  <div className="aspect-w-16 aspect-h-9">
                    <Image src="/after-1.jpg" alt="After 1" width={640} height={360} className="w-full h-auto object-contain rounded-lg" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Before and After Comparison</CardTitle>
              <CardDescription>See the difference your logo makes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: 'red' }}>Before</h3>
                  <div className="aspect-w-16 aspect-h-9">
                    <Image src="/before-2.jpg" alt="Before 2" width={640} height={360} className="w-full h-auto object-contain rounded-lg" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: 'green' }}>After</h3>
                  <div className="aspect-w-16 aspect-h-9">
                    <Image src="/after-2.jpg" alt="After 2" width={640} height={360} className="w-full h-auto object-contain rounded-lg" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Before and After Comparison</CardTitle>
              <CardDescription>See the difference your logo makes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: 'red' }}>Before</h3>
                  <div className="aspect-w-16 aspect-h-9">
                    <Image src="/before-3.jpg" alt="Before 3" width={640} height={360} className="w-full h-auto object-contain rounded-lg" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: 'green' }}>After</h3>
                  <div className="aspect-w-16 aspect-h-9">
                    <Image src="/after-3.jpg" alt="After 3" width={640} height={360} className="w-full h-auto object-contain rounded-lg" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Before and After Comparison</CardTitle>
              <CardDescription>See the difference your logo makes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: 'red' }}>Before</h3>
                  <div className="aspect-w-16 aspect-h-9">
                    <Image src="/before-4.jpg" alt="Before 4" width={640} height={360} className="w-full h-auto object-contain rounded-lg" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: 'green' }}>After</h3>
                  <div className="aspect-w-16 aspect-h-9">
                    <Image src="/after-4.jpg" alt="After 4" width={640} height={360} className="w-full h-auto object-contain rounded-lg" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Before and After Comparison</CardTitle>
              <CardDescription>See the difference your logo makes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: 'red' }}>Before</h3>
                  <div className="aspect-w-16 aspect-h-9">
                    <Image src="/before-5.jpg" alt="Before 5" width={640} height={360} className="w-full h-auto object-contain rounded-lg" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: 'green' }}>After</h3>
                  <div className="aspect-w-16 aspect-h-9">
                    <Image src="/after-5.jpg" alt="After 5" width={640} height={360} className="w-full h-auto object-contain rounded-lg" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12">
          {/* Removed the Inspiration Gallery section */}
          {/* <h2 className="text-2xl font-bold text-center mb-6">Inspiration Gallery</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((src, index) => (
              <div key={index} className="aspect-square">
                <Image src={src} alt={`Inspiration ${index + 1}`} width={300} height={300} className="w-full h-full object-cover rounded-lg" />
              </div>
            ))}
          </div>
          <div ref={observerTarget} className="h-10 flex items-center justify-center">
            {loading && <p>Loading more...</p>}
          </div> */}
        </div>
      </div>
      {isDialogOpen && (
        <div id="initial-dialog" className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-4 rounded shadow-lg">
            <h2 className="text-lg font-bold">This generation will cost 1 credit.</h2>
            <p>Are you ready to proceed?</p>
            <div className="flex justify-end mt-4">
              <Button onClick={handleDialogConfirm}>I am ready</Button>
            </div>
          </div>
        </div>
      )}

      {isUserInfoDialogOpen && (
        <div id="user-info-dialog" className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-4 rounded shadow-lg">
            <h2 className="text-lg font-bold">Please provide your information.</h2>
            <h2 className="text-lg font-bold">Generated files will be sent to this email</h2>
            <div className="space-y-4">
              <div>
                <Input 
                  type="email" 
                  placeholder="Email Address" 
                  value={userEmail} 
                  onChange={(e) => setUserEmail(e.target.value)} 
                  className={userEmail && !isValidEmail ? 'border-red-500' : ''}
                />
                {userEmail && !isValidEmail && (
                  <p className="text-red-500 text-sm mt-1">Please enter a valid email address.</p>
                )}
              </div>
              <Input 
                type="text" 
                placeholder="Your Name" 
                value={userName} 
                onChange={(e) => setUserName(e.target.value)} 
              />
            </div>
            <div className="flex justify-end mt-4">
              <Button 
                onClick={handleUserInfoDialogConfirm} 
                disabled={!isSubmitEnabled}
              >
                Submit
              </Button>
            </div>
          </div>
        </div>
      )}

      {isPurchaseDialogOpen && (
        <div id="purchase-dialog" className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-4 rounded shadow-lg">
            <h2 className="text-lg font-bold">Purchase Credits</h2>
            <div className="flex justify-center my-4">
              <Image src="/paypal.png" alt="PayPal" width={200} height={100} className="w-auto h-auto" />
            </div>
            <Button 
              onClick={() => window.open('https://www.paypal.com/invoice/p/#INV2-FRRR-L3HH-M6YY-3UTP', '_blank')}
              className="w-full mt-4"
            >
              Buy Now
            </Button>
            <Button 
              onClick={() => {
                setIsPurchaseDialogOpen(false);
                setIsPaymentDetailsDialogOpen(true);
              }}
              className="w-full mt-2"
              variant="outline"
            >
              I've completed the payment
            </Button>
          </div>
        </div>
      )}

      {isPaymentDetailsDialogOpen && (
        <div id="payment-details-dialog" className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-4 rounded shadow-lg">
            <h2 className="text-lg font-bold">Enter Payment Details</h2>
            <div className="space-y-4 mt-4">
              <Input 
                type="text" 
                placeholder="PayPal Transaction ID" 
                value={paypalTransactionId} 
                onChange={(e) => setPaypalTransactionId(e.target.value)} 
              />
              <Input 
                type="file" 
                accept="image/*,.pdf" 
                onChange={(e) => e.target.files && setPaypalReceipt(e.target.files[0])} 
              />
            </div>
            <Button 
              onClick={handlePaymentDetailsSubmit}
              className="w-full mt-4"
              disabled={!paypalTransactionId || !paypalReceipt}
            >
              Submit Payment Details
            </Button>
          </div>
        </div>
      )}

      {isPaymentReportDialogOpen && (
        <div id="payment-report-dialog" className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-4 rounded shadow-lg">
            <h2 className="text-lg font-bold">Report Your Payment</h2>
            <p>If you've completed the payment, click the button below to receive your receipt.</p>
            <Button 
              onClick={handlePaymentReport}
              className="w-full mt-4"
            >
              I've made the payment
            </Button>
          </div>
        </div>
      )}

      {isReceiptDialogOpen && (
        <div id="receipt-dialog" className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-4 rounded shadow-lg">
            <h2 className="text-lg font-bold">Payment Successful</h2>
            <p>Thank you for your purchase! Here's your receipt:</p>
            <div className="mt-4 p-4 bg-gray-100 rounded">
              <p><strong>Receipt Number:</strong> {receiptNumber}</p>
              <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
              <p><strong>Amount:</strong> $X.XX</p>
              <p><strong>Item:</strong> 1 Credit for LogoMagic Pro</p>
            </div>
            <Button 
              onClick={() => setIsReceiptDialogOpen(false)}
              className="w-full mt-4"
            >
              Add More Logos
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}