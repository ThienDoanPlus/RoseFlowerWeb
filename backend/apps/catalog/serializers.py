# pyrefly: ignore [missing-import]
from rest_framework import serializers
from .models import Category, Flower

class CategorySerializer(serializers.ModelSerializer):
    flower_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'icon_name', 'display_order', 'flower_count']

    def get_flower_count(self, obj):
        return obj.flowers.count()

class FlowerListSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    categoryId = serializers.CharField(source='category_id', read_only=True)
    basePrice = serializers.IntegerField(source='base_price', read_only=True)
    salePrice = serializers.IntegerField(source='sale_price', read_only=True, allow_null=True)
    current_price = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    imageUrl = serializers.CharField(source='image_url', read_only=True)
    shortDescription = serializers.CharField(source='short_description', read_only=True)
    ratingAvg = serializers.FloatField(source='rating_avg', read_only=True)
    reviewsCount = serializers.IntegerField(source='reviews_count', read_only=True)
    isInStock = serializers.BooleanField(source='is_in_stock', read_only=True)
    isFeatured = serializers.BooleanField(source='is_featured', read_only=True)
    designStyle = serializers.CharField(source='design_style', read_only=True)
    colorTone = serializers.CharField(source='color_tone', read_only=True)
    flowerType = serializers.CharField(source='flower_type', read_only=True)
    priceRangeCategory = serializers.CharField(source='price_range_category', read_only=True)

    class Meta:
        model = Flower
        fields = [
            'id', 'name', 'botanical_name', 'category', 'category_name', 'categoryId',
            'base_price', 'sale_price', 'current_price', 'basePrice', 'salePrice',
            'image_url', 'imageUrl', 'gallery',
            'short_description', 'shortDescription', 'meaning',
            'occasions', 'recipients',
            'design_style', 'designStyle',
            'color_tone', 'colorTone',
            'flower_type', 'flowerType',
            'price_range_category', 'priceRangeCategory',
            'rating_avg', 'ratingAvg', 'reviews_count', 'reviewsCount',
            'is_featured', 'isFeatured', 'is_in_stock', 'isInStock'
        ]

class FlowerDetailSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), source='category', write_only=True
    )
    categoryId = serializers.CharField(source='category.id', read_only=True)
    basePrice = serializers.IntegerField(source='base_price', read_only=True)
    salePrice = serializers.IntegerField(source='sale_price', read_only=True, allow_null=True)
    imageUrl = serializers.CharField(source='image_url', read_only=True)
    shortDescription = serializers.CharField(source='short_description', read_only=True)
    ratingAvg = serializers.FloatField(source='rating_avg', read_only=True)
    reviewsCount = serializers.IntegerField(source='reviews_count', read_only=True)
    isInStock = serializers.BooleanField(source='is_in_stock', read_only=True)
    isFeatured = serializers.BooleanField(source='is_featured', read_only=True)
    designStyle = serializers.CharField(source='design_style', read_only=True)
    colorTone = serializers.CharField(source='color_tone', read_only=True)
    flowerType = serializers.CharField(source='flower_type', read_only=True)
    priceRangeCategory = serializers.CharField(source='price_range_category', read_only=True)

    class Meta:
        model = Flower
        fields = [
            'id', 'name', 'botanical_name', 'category', 'category_id', 'categoryId',
            'base_price', 'sale_price', 'basePrice', 'salePrice',
            'image_url', 'imageUrl', 'gallery',
            'short_description', 'shortDescription', 'description', 'meaning', 'care_guide',
            'occasions', 'recipients',
            'design_style', 'designStyle',
            'color_tone', 'colorTone',
            'flower_type', 'flowerType',
            'price_range_category', 'priceRangeCategory',
            'rating_avg', 'ratingAvg', 'reviews_count', 'reviewsCount',
            'is_featured', 'isFeatured', 'is_in_stock', 'isInStock', 'created_at'
        ]
