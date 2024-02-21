type DeferredPayment = {
  id: string;
  amount: number;
  dueDate: Date;
  paid: boolean;
  forgiven: boolean;
  saleId: string;
};

type PaymentMethod = {
  id: string;
  description: string;
  createAt: Date;
  status: boolean;
};

type SalePaymentMethod = {
  saleId: string;
  paymentMethodId: string;
  amount: number;
  paymentMethod: PaymentMethod;
};

type ItemSale = {
  id: string;
  productId?: string; // O campo é opcional
  serviceId?: string; // O campo é opcional
  isGift: boolean;
  saleId: string;
  quantity: number;
  vehicleId?: string; // O campo é opcional
  vehicle?: Vehicle; // Assumindo que o tipo Vehicle será ajustado para incluir esta relação
  service?: Service;
  product?: Product;
  sale: Sale; // Assumindo que você já tem um tipo Sale definido
};

type Service = {
  id: string;
  description: string;
  name: string;
  costPrice: number;
  salePrice: number;
  createAt: Date;
  status: boolean;
  itemSales?: ItemSale[]; // Assumindo que você tem um tipo definido para ItemSale
};

type Product = {
  id: string;
  name: string;
  description: string;
  costPrice: number;
  salePrice: number;
  createAt: Date;
  supplierId?: string; // '?' indica que o campo é opcional
  supplier?: Supplier; // Assumindo que você tem um tipo definido para Supplier
  status: boolean;
  itemSales: ItemSale[]; // Assumindo que você tem um tipo definido para ItemSale
};

// Assumindo que os tipos ItemSale e Supplier são definidos em algum lugar
// Por exemplo, uma definição de tipo simplificada para Supplier poderia ser:
type Supplier = {
  id: string;
  // Adicione outros campos conforme necessário
};

type Vehicle = {
  id: string;
  model: string;
  licensePlate: string;
  customerId?: string; // O campo é opcional
  customer?: Customer; // Assumindo que você já tem um tipo Customer definido
  itemSales: ItemSale[]; // Relação de um para muitos com ItemSale
};

type Customer = {
  id: string;
  name: string | null;
  birthday: Date | null;
  nickname: string | null;
  gender: string | null;
  document: string;
  phone: string | null;
  Sales: Sale[]; // Note que este é um relacionamento de um para muitos
  Vehicles: Vehicle[];
};

type Employee = {
  id: string;
  name: string;
  document: string;
  nickname?: string | null;
  gender: string;
  phone: string;
  createAt: Date;
  birthday: Date;
  status: boolean;
  commission: number;
  // Os seguintes campos são relações e você precisa definir tipos separados para cada um deles também.
  // stores: EmployeeStore[];
  // sales: EmployeeSale[];
  // salaries: Salary[];
  // advances: Advance[];
  // user?: User | null; // Presumindo que User é um tipo já definido em algum lugar no seu código.
};

type Sale = {
  id: string;
  grossPrice: number;
  netPrice: number;
  discount: number | null;
  createAt: Date;
  isDeferredPayment: boolean | null;
  pickupTime: string | null;
  deferredPayments: DeferredPayment[];
  note: string | null;
  items: ItemSale[];
  salePayments: SalePaymentMethod[];
  customerId: string | null;
  customer: Customer | null;
  statusSaleId: string;
  statusSale: StatusSale; // Parece que essa propriedade está faltando na sua tentativa de atribuição
};

type StatusSale = {
  id: string;
  description: string;
  createAt: Date;
  status: boolean;
  // A propriedade 'sales' indica uma relação com a model 'Sale'.
  // Você precisaria definir o type 'Sale' se ainda não o fez.
  sales: Sale[];
};


