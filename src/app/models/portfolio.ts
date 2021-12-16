export class Portfolio {
  constructor(
    public uid_association: string,
    public type: string,
    public titre: string,
    public lieu: string,
    public published: Date,
    public lien: string,
    public date: Date,
    public uid?: string
  ) {}
}
