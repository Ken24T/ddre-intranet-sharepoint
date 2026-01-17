/**
 * Favourites data model stored per user.
 */
export interface IFavouriteCard {
  /** ID of the source card */
  cardId: string;
  /** Source hub where the card lives */
  sourceHubKey: string;
  /** ISO timestamp when the card was added */
  addedAt: string;
}
