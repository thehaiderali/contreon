
import { api } from '@/lib/api'
import React, { useEffect, useState } from 'react'

const MembershipCard = ({ id, name, price }) => {
  const [isLoading, setIsLoading] = useState(false)

  const handleSubscribe = async () => {
    setIsLoading(true)
    try {
      const data = {
        membershipId: id,
      }
      const response = await api.post("/subscriptions/create", data)
      console.log("Response : ",response)
      if (response.data.success) {
        // Handle successful subscription (e.g., show success message, redirect to payment)
        console.log("Subscription created:", response.data)
        alert("Successfully subscribed!")
      }
    } catch (error) {
      console.error("Subscription failed:", error)
      alert("Failed to subscribe. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="membership-card">
      {id}
      <br /> Name: {name} <br /> 
      Price: ${price}
      <br />
      <br />
      <br />
      <button 
      className='border-4 border-white'
        onClick={handleSubscribe} 
        disabled={isLoading}
      >
        {isLoading ? "Processing..." : "Click to Subscribe"}
      </button>
    </div>
  )
}

const Feed = () => {
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(true);

  const getMemberships = async () => {
    try {
      setLoading(true)
      const response = await api.get("/memberships");
      console.log("Memberships : ", response.data.data.memberships)
      setMemberships(response.data.data.memberships)
    } catch (error) {
      console.error("Failed to fetch memberships:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getMemberships();
  }, [])

  return (
    <div>
      <h1>Membership Plans</h1>
      {loading ? (
        <p>Loading memberships...</p>
      ) : (
        <div className="memberships-grid">
          {memberships.map((membership) => (
            <MembershipCard
              key={membership._id}
              id={membership._id}
              name={membership.tierName}
              price={membership.price}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default Feed