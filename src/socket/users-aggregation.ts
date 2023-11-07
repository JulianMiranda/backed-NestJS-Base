import * as mongoose from 'mongoose';

export const users = (userId: string[]) => [
	{
		$match: {
			_id: {
				$in: userId.map((x) => mongoose.Types.ObjectId(x)),
			},
		},
	},
	{
		$lookup: {
			from: 'images',
			let: {image: '$image'},
			pipeline: [
				{
					$match: {
						$expr: {
							$and: [{$eq: ['$_id', '$$image']}, {$eq: ['$status', true]}],
						},
					},
				},
				{
					$project: {
						url: 1,
						blurHash: 1,
						id: '$_id',
						_id: 0,
					},
				},
			],
			as: 'image',
		},
	},
	{
		$unwind: {
			path: '$image',
			preserveNullAndEmptyArrays: true,
		},
	},
	{
		$project: {
			name: 1,
			status: 1,
			online: 1,
			email: 1,
			firebaseId: 1,
			role: 1,
			image: 1,
			id: '$_id',
			_id: 0,
		},
	},
];
