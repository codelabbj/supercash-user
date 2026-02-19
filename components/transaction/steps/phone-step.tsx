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
  /** Affichage en liste verticale (au lieu de grille) */
  listLayout?: boolean
}

import { cn } from "@/lib/utils"

export function PhoneStep({ selectedNetwork, selectedPhone, onSelect, type, listLayout }: PhoneStepProps) {
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
    <div className={cn(listLayout ? "space-y-2" : "space-y-4 sm:space-y-6")}>
      <div className={cn("text-center space-y-0.5 mb-3", listLayout && "mb-2")}>
        <h2 className={cn("font-bold text-foreground", listLayout ? "text-base sm:text-lg" : "text-base sm:text-xl")}>Votre numéro de réception</h2>
        {!listLayout && <p className="text-xs sm:text-sm text-muted-foreground">Numéro pour recevoir vos fonds</p>}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12 sm:py-20">
          <Loader2 className="h-8 w-8 sm:h-10 sm:w-10 animate-spin text-gold dark:text-turquoise" />
        </div>
      ) : (
        <div className={cn(listLayout ? "flex flex-col gap-2.5" : "grid grid-cols-2 gap-2 sm:gap-4")}>
          {phones.map((phone) => {
            const selected = selectedPhone?.id === phone.id
            const isDeposit = type === "deposit"
            if (listLayout) {
              return (
                <div
                  key={phone.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => onSelect(phone)}
                  onKeyDown={(e) => e.key === "Enter" && onSelect(phone)}
                  className={cn(
                    "rounded-xl overflow-hidden transition-all duration-200 active:scale-[0.99] cursor-pointer",
                    "flex items-center gap-3 py-2.5 px-3 border border-border/60",
                    selected
                      ? "bg-muted/60 dark:bg-muted/40 border-l-4 border-l-primary"
                      : "bg-card hover:bg-muted/40 dark:hover:bg-muted/30 border-l-4 border-l-transparent hover:border-border"
                  )}
                >
                  <div className={cn(
                    "w-9 h-9 rounded-lg flex items-center justify-center shrink-0 text-[10px] font-semibold bg-muted/50 dark:bg-muted/50 text-foreground",
                    selected && "ring-2 ring-primary/20"
                  )}>
                    +{phone.phone.slice(0, 3)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold truncate text-foreground">+{phone.phone}</p>
                    <p className="text-[10px] truncate text-muted-foreground">
                      Enregistré · {new Date(phone.created_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" })}
                    </p>
                  </div>
                  <div className="flex items-center gap-0.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg hover:bg-muted/60" onClick={() => openEditDialog(phone)}>
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg hover:bg-muted/60" onClick={() => handleDeletePhone(phone)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  {selected && (
                    <div className="w-5 h-5 rounded-full shrink-0 bg-primary/20 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    </div>
                  )}
                </div>
              )
            }
            return (
              <Card
                key={phone.id}
                className={cn(
                  "relative overflow-hidden cursor-pointer transition-all duration-200 border shadow-sm hover:shadow-md active:scale-[0.98] rounded-xl sm:rounded-lg",
                  selected ? (isDeposit ? "bg-gold text-white shadow-lg ring-2 ring-gold/30" : "bg-turquoise text-white shadow-lg ring-2 ring-turquoise/30") : "bg-card border-border/80 hover:border-primary/20"
                )}
                onClick={() => onSelect(phone)}
              >
                <CardContent className="p-2.5 sm:p-4 min-h-[88px] sm:min-h-[108px] flex flex-col justify-between relative z-10">
                  <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                    <div className={cn("w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 text-[10px] sm:text-xs font-black", selected ? "bg-white/20" : "bg-gold/10 text-gold dark:bg-turquoise/10 dark:text-turquoise")}>+{phone.phone.slice(0, 3)}</div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm sm:text-base font-black tracking-tight break-all">{phone.phone.slice(3)}</h3>
                      <p className={cn("text-[7px] sm:text-[8px] font-bold uppercase tracking-wider opacity-60", selected ? "text-white" : "text-muted-foreground")}>Enregistré</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-1 mt-2 sm:mt-3">
                    <div className="flex items-center gap-1 min-w-0">
                      <Badge variant="secondary" className={cn("font-bold text-[9px] sm:text-[10px] px-1.5 py-0 shrink-0", selected ? "bg-white/20 text-white" : "bg-gold/10 text-gold dark:bg-turquoise/10 dark:text-turquoise")}>Prêt</Badge>
                      <span className={cn("text-[8px] sm:text-[9px] font-mono opacity-50 truncate", selected ? "text-white" : "text-muted-foreground")}>{new Date(phone.created_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" })}</span>
                    </div>
                    <div className="flex gap-0.5 shrink-0">
                      <Button variant="ghost" size="icon" className={cn("h-6 w-6 sm:h-7 sm:w-7 rounded-full transition-colors", selected ? "bg-white/10 hover:bg-white/20" : "hover:bg-gold/10 dark:hover:bg-turquoise/10 hover:text-gold dark:hover:text-turquoise")} onClick={(e) => { e.stopPropagation(); openEditDialog(phone) }}><Edit className="h-3 w-3 sm:h-3.5 sm:w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className={cn("h-6 w-6 sm:h-7 sm:w-7 rounded-full transition-colors", selected ? "bg-white/10 hover:bg-white/20" : "hover:bg-gold/10 dark:hover:bg-turquoise/10 hover:text-gold dark:hover:text-turquoise")} onClick={(e) => { e.stopPropagation(); handleDeletePhone(phone) }}><Trash2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" /></Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}

          <button
            type="button"
            onClick={() => setIsAddDialogOpen(true)}
            className={cn(
              "rounded-lg border-2 border-dashed transition-all flex items-center justify-center gap-2 py-2.5 px-3 group",
              listLayout
                ? "border-border/60 hover:border-border hover:bg-muted/40 dark:hover:bg-muted/30 text-muted-foreground hover:text-foreground"
                : "min-h-[88px] sm:min-h-[108px] rounded-xl sm:rounded-2xl border-muted-foreground/25 hover:border-gold/50 dark:hover:border-turquoise/50 hover:bg-gold/5 dark:hover:bg-turquoise/5"
            )}
          >
            <div className={cn(
              "rounded-full flex items-center justify-center transition-colors",
              listLayout ? "w-8 h-8 bg-muted/60 group-hover:bg-muted text-foreground" : "w-8 h-8 sm:w-10 sm:h-10 bg-muted group-hover:bg-gold dark:group-hover:bg-turquoise group-hover:text-white dark:group-hover:text-black"
            )}>
              <Plus className={listLayout ? "h-4 w-4" : "h-4 w-4 sm:h-5 sm:w-5"} />
            </div>
            <span className={cn("font-semibold text-muted-foreground transition-colors", listLayout ? "text-xs group-hover:text-foreground" : "text-xs sm:text-sm group-hover:text-gold dark:group-hover:text-turquoise")}>Ajouter</span>
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
