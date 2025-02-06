'use client'
import Dropdown from '@/components/Dropdown'
import Dialog from '@/components/Dialog'
import Popover from '@/components/Popover'
import Input from '@/components/Input'
import Select from '@/components/Select'
import Switch from '@/components/Switch'
import Button from '@/components/Button'
import { useState } from 'react'

export default function Testing() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [autoUpdateEnabled, setAutoUpdateEnabled] = useState(false)

  const popoverItems = [
    {
      title: 'Insights',
      description: 'Measure actions your users take',
      href: '#'
    },
    {
      title: 'Automations',
      description: 'Create your own targeted content',
      href: '#'
    },
    {
      title: 'Reports',
      description: 'Keep track of your growth',
      href: '#'
    }
  ]

  const documentationItem = {
    title: 'Documentation',
    description: 'Start integrating products and tools',
    href: '#'
  }

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'paused', label: 'Paused' },
    { value: 'delayed', label: 'Delayed' },
    { value: 'canceled', label: 'Canceled' }
  ]

  return (
    <div className="p-8 space-y-8">
      <div className="flex gap-8 items-center">
        <span className="text-sm font-semibold text-white/50">Products</span>
        <Popover 
          mainItems={popoverItems}
          documentationItem={documentationItem}
        />
        <span className="text-sm font-semibold text-white/50">Pricing</span>
      </div>
      
      <div className="max-w-md space-y-4">
        <Input 
          label="Name"
          description="Use your real name so people will recognize you."
          placeholder="Enter your name"
          required
        />
        
        <Select
          label="Project status"
          description="This will be visible to clients on the project."
          options={statusOptions}
          required
        />

        <div className="space-y-3">
          <Switch
            checked={notificationsEnabled}
            onChange={setNotificationsEnabled}
            label="Enable notifications"
            description="Get notified when someone mentions you."
          />
          
          <Switch
            checked={autoUpdateEnabled}
            onChange={setAutoUpdateEnabled}
            label="Auto-update"
            description="Keep your application up to date automatically."
          />
        </div>

        <div className="flex gap-3 pt-4">
          <Button variant="primary">Save changes</Button>
          <Button variant="secondary">Cancel</Button>
          <Button variant="danger" size="sm">Delete</Button>
        </div>
      </div>
      
      <Dropdown />
      
      <Dialog 
        title="Payment successful"
        description="Your payment has been successfully submitted. We've sent you an email with all of the details of your order."
      />
    </div>
  )
}
