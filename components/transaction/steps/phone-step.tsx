"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Loader2, Plus, Edit, Trash2 } from "lucide-react"
import { phoneApi } from "@/lib/api-client"
import type { UserPhone, Network } from "@/lib/types"
import { toast } from "react-hot-toast"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const COUNTRIES = [
  { code: "225", name: "Côte d'Ivoire" },
  { code: "229", name: "Bénin" },
  { code: "221", name: "Sénégal" },
  { code: "226", name: "Burkina Faso" },
]

interface PhoneStepProps {
  selectedNetwork: Network | null
  selectedPhone: UserPhone | null
  onSelect: (phone: UserPhone) => void
  onNext: () => void
  type: "deposit" | "withdrawal"
}

import { cn } from "@/lib/utils"

export function PhoneStep({ selectedNetwork, selectedPhone, onSelect, type }: PhoneStepProps) {
  const [phones, setPhones] = useState<UserPhone[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingPhone, setEditingPhone] = useState<UserPhone | null>(null)
  const [newPhone, setNewPhone] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedCountry, setSelectedCountry] = useState<string>("225")
  const [selectedEditCountry, setSelectedEditCountry] = useState<string>("225")

  // ... (keeping getErrorMessage and useEffect)
  const getErrorMessage = (error: any): string => {
    if (error?.response?.data && typeof error.response.data === 'object') {
      const errorData = error.response.data
      if (errorData.phone && Array.isArray(errorData.phone) && errorData.phone.length > 0) {
        return errorData.phone[0]
      }
      const errorFields = ['phone', 'network', 'user']
      for (const field of errorFields) {
        if (errorData[field] && Array.isArray(errorData[field]) && errorData[field].length > 0) {
          return errorData[field][0]
        }
      }
    }
    return "Une erreur inattendue s'est produite"
  }

  useEffect(() => {
    if (selectedNetwork) {
      fetchPhones()
    }
  }, [selectedNetwork])

  const fetchPhones = async () => {
    if (!selectedNetwork) return
    setIsLoading(true)
    try {
      const data = await phoneApi.getAll()
      const networkPhones = data.filter(phone => phone.network === selectedNetwork.id)
      setPhones(networkPhones)
    } catch (error) {
      toast.error("Erreur lors du chargement des numéros de téléphone")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddPhone = async () => {
    if (!selectedNetwork || !newPhone) return
    setIsSubmitting(true)
    try {
      await phoneApi.create(
        selectedCountry + newPhone,
        selectedNetwork.id,
      )
      toast.success("Numéro ajouté avec succès")
      setIsAddDialogOpen(false)
      setNewPhone("")
      fetchPhones()
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditPhone = async () => {
    if (!editingPhone || !newPhone || !selectedNetwork) return
    setIsSubmitting(true)
    try {
      await phoneApi.update(
        editingPhone.id,
        selectedEditCountry + newPhone,
        selectedNetwork.id
      )
      toast.success("Numéro modifié avec succès")
      setIsEditDialogOpen(false)
      setEditingPhone(null)
      setNewPhone("")
      fetchPhones()
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeletePhone = async (phone: UserPhone) => {
    if (!confirm("Voulez-vous vraiment supprimer ce numéro ?")) return
    try {
      await phoneApi.delete(phone.id)
      toast.success("Numéro supprimé avec succès")
      fetchPhones()
    } catch (error) {
      toast.error("Erreur lors de la suppression")
    }
  }

  const openEditDialog = (phone: UserPhone) => {
    setEditingPhone(phone)
    // Try to split country code (3 digits usually for these)
    const countryCode = phone.phone.slice(0, 3)
    const phoneNumber = phone.phone.slice(3)
    setSelectedEditCountry(countryCode)
    setNewPhone(phoneNumber)
    setIsEditDialogOpen(true)
  }

  if (!selectedNetwork) {
    return (
      <Card className="border-none bg-muted/5">
        <CardContent className="flex items-center justify-center py-20 text-muted-foreground font-bold">
          Veuillez d'abord sélectionner un réseau
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-1 mb-6">
        <h2 className="text-lg sm:text-xl font-bold text-foreground">Votre numéro de réception</h2>
        <p className="text-sm text-muted-foreground font-medium">Sélectionnez le numéro pour recevoir vos fonds</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-gold dark:text-turquoise" />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {phones.map((phone) => (
            <Card
              key={phone.id}
              className={cn(
                "relative overflow-hidden cursor-pointer transition-all duration-200 border shadow-sm hover:shadow-md active:scale-[0.99] group rounded-lg",
                selectedPhone?.id === phone.id
                  ? type === "deposit"
                    ? "bg-gold text-white shadow-gold-lg ring-2 ring-gold/20"
                    : "bg-turquoise text-white shadow-turquoise-lg ring-2 ring-turquoise/20"
                  : "bg-white dark:bg-[#121212] hover:shadow-2xl"
              )}
              onClick={() => onSelect(phone)}
            >
              <CardContent className="p-4 flex flex-col justify-between h-[120px] relative z-10">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center transition-colors shadow-inner",
                      selectedPhone?.id === phone.id ? "bg-white/20" : "bg-gold/5 text-gold"
                    )}>
                      <span className="font-black text-sm">+{phone.phone.slice(0, 3)}</span>
                    </div>
                    <div className="space-y-0">
                      <h3 className="text-lg font-black tracking-tighter">
                        {phone.phone.slice(3)}
                      </h3>
                      <p className={cn(
                        "text-[8px] font-black uppercase tracking-widest opacity-60",
                        selectedPhone?.id === phone.id ? "text-white" : "text-muted-foreground"
                      )}>
                        Numéro Enregistré
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-0.5">
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "h-6 w-6 rounded-full transition-colors",
                        selectedPhone?.id === phone.id
                          ? "bg-white/10 hover:bg-white/20"
                          : "hover:bg-gold/10 dark:hover:bg-turquoise/10 hover:text-gold dark:hover:text-turquoise"
                      )}
                      onClick={(e) => {
                        e.stopPropagation()
                        openEditDialog(phone)
                      }}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "h-6 w-6 rounded-full transition-colors",
                        selectedPhone?.id === phone.id
                          ? "bg-white/10 hover:bg-white/20"
                          : "hover:bg-gold/10 dark:hover:bg-turquoise/10 hover:text-gold dark:hover:text-turquoise"
                      )}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeletePhone(phone)
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <Badge
                    variant="secondary"
                    className={cn(
                      "font-bold text-[10px]",
                      selectedPhone?.id === phone.id
                        ? "bg-white/20 text-white"
                        : "bg-gold/5 text-gold"
                    )}
                  >
                    Prêt
                  </Badge>
                  <span className={cn(
                    "text-[8px] font-mono opacity-50 ml-auto",
                    selectedPhone?.id === phone.id ? "text-white" : "text-muted-foreground"
                  )}>
                    {new Date(phone.created_at).toLocaleDateString("fr-FR")}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}

          <button
            onClick={() => setIsAddDialogOpen(true)}
            className="h-[120px] rounded-[24px] border-2 border-dashed border-muted-foreground/20 hover:border-gold/40 dark:hover:border-turquoise/40 hover:bg-gold/5 dark:hover:bg-turquoise/5 transition-all flex flex-col items-center justify-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center group-hover:bg-gold dark:group-hover:bg-turquoise group-hover:text-white dark:group-hover:text-black transition-colors">
              <Plus className="h-5 w-5" />
            </div>
            <span className="font-black text-sm text-muted-foreground group-hover:text-gold dark:group-hover:text-turquoise transition-colors">Ajouter</span>
          </button>
        </div>
      )}

      {/* Add Phone Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="bg-white dark:bg-[#121212] border-none shadow-2xl rounded-[var(--radius)]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black">Ajouter un numéro</DialogTitle>
            <DialogDescription className="font-medium">
              Entrez votre numéro {selectedNetwork.public_name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="country" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Pays</Label>
              <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                <SelectTrigger id="country" className="h-12 rounded-xl bg-muted/50 border-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                      {country.name} (+{country.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Numéro de téléphone</Label>
              <Input
                id="phone"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                placeholder="Ex: 0712345678"
                maxLength={10}
                className="h-12 rounded-xl bg-muted/50 border-none text-lg font-bold"
              />
              <p className="text-[10px] text-muted-foreground font-medium italic">
                Maximum 10 chiffres (sans le code pays)
              </p>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setIsAddDialogOpen(false)} className="font-bold">
              Annuler
            </Button>
            <Button
              onClick={handleAddPhone}
              disabled={!newPhone.trim() || isSubmitting}
              variant="deposit"
              className="px-8 font-black uppercase tracking-widest"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Ajouter"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Phone Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-white dark:bg-[#121212] border-none shadow-2xl rounded-[var(--radius)]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black">Modifier le numéro</DialogTitle>
            <DialogDescription className="font-medium">
              Modifiez votre numéro {selectedNetwork.public_name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="editCountry" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Pays</Label>
              <Select value={selectedEditCountry} onValueChange={setSelectedEditCountry}>
                <SelectTrigger id="editCountry" className="h-12 rounded-xl bg-muted/50 border-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                      {country.name} (+{country.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="editPhone" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Numéro de téléphone</Label>
              <Input
                id="editPhone"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                placeholder="Ex: 0712345678"
                maxLength={10}
                className="h-12 rounded-xl bg-muted/50 border-none text-lg font-bold"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setIsEditDialogOpen(false)} className="font-bold">
              Annuler
            </Button>
            <Button
              onClick={handleEditPhone}
              disabled={!newPhone.trim() || isSubmitting}
              variant="deposit"
              className="px-8 font-black uppercase tracking-widest"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Modifier"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
