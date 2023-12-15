export default interface Team {
  id?: string;
  name: string;
  title: string;
  image: string;
  description: string;
  num_datasets: number;
  users?: Array<any>;
}
